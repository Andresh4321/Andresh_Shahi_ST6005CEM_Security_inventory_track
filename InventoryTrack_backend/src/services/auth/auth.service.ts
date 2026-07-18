import { RegisterDTO, LoginDto, UpdateUserDto, AdminLoginDTO } from "../../dtos/auth/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES } from "../../config";
import { HttpError } from "../../errors/http_error";
import { UserRepository } from "../../routes/repositories/auth/auth.respository";
import { validatePasswordStrength, isPasswordExpired } from "../../utils/passwordPolicy";
import { encryptData, decryptData } from "../../utils/encryption";
import { generateMfaSecret, generateQRCode, verifyMfaToken } from "../../utils/mfa";
import { UserModel, IUser } from "../../models/auth/user.models";
import { recordFailedAttempt, clearFailedAttempts } from "../../middleware/ipBlock.middleware";
import { SecurityMonitoringService } from "../security/monitoring.service";

let userRepository = new UserRepository();

export class AuthService {

    // ========== REGISTER WITH PASSWORD POLICY ==========
    async registerUser(data: RegisterDTO) {
        const emailExists = await userRepository.getUserByEmail(data.email);
        if (emailExists) {
            throw new HttpError(409, "Email already exists");
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(data.password, data.email);
        if (!passwordValidation.isValid) {
            throw new HttpError(400, `Password policy violation: ${passwordValidation.errors.join(', ')}`);
        }

        const hashedPassword = await bcryptjs.hash(data.password, 12); // Increased rounds from 10 to 12
        const originalPassword = data.password;
        data.password = hashedPassword;

        // Encrypt sensitive data (phone_number) before storage
        const userData: any = { ...data };
        if (userData.phone_number) {
            userData.phone_number = encryptData(userData.phone_number);
        }

        // Set password creation date and initial password history
        userData.passwordCreatedAt = new Date();
        userData.previousPasswords = [{ hash: hashedPassword, changedAt: new Date() }];
        userData.emailVerified = false;

        const newUser = await userRepository.createUser(userData);

        const payload = {
            id: newUser._id,
            email: newUser.email,
            phone_number: data.phone_number, // Return original (unencrypted) to client
            role: newUser.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        return { user: newUser, token, passwordStrength: passwordValidation.strength };
    }

    // ========== LOGIN WITH LOCKOUT + MFA + PASSWORD EXPIRY + SESSION BINDING ==========
    async loginUser(data: LoginDto, clientIp?: string, userAgent?: string) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Check if user is an OAuth-only account (no local password)
        if (user.authProvider === 'google' && !user.password) {
            throw new HttpError(400, "This account uses Google Sign-In. Please log in with Google.");
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            throw new HttpError(423, `Account is locked. Try again in ${remainingMinutes} minutes.`);
        }

        const validPassword = await bcryptjs.compare(data.password, user.password as string);

        if (!validPassword) {
            // Record IP-based failed attempt for IP blocking
            await recordFailedAttempt(clientIp || 'unknown', '/api/auth/login');

            // Increment failed login attempts
            const updates: any = {
                loginAttempts: (user.loginAttempts || 0) + 1,
                $push: {
                    failedLoginAttempts: {
                        timestamp: new Date(),
                        ip: clientIp || 'unknown'
                    }
                }
            };

            // Generate security alert at 5 failed attempts
            const attemptCount = (user.loginAttempts || 0) + 1;
            if (attemptCount === 5) {
                SecurityMonitoringService.alertBruteForce(clientIp || 'unknown', attemptCount, data.email).catch(() => {});
            }

            // Lock account if max attempts reached
            if (attemptCount >= MAX_LOGIN_ATTEMPTS) {
                updates.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
                await UserModel.findByIdAndUpdate(user._id, updates);

                // Generate account locked alert
                SecurityMonitoringService.alertAccountLocked(
                    user._id.toString(), user.email, clientIp || 'unknown'
                ).catch(() => {});

                throw new HttpError(423, `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`);
            }

            await UserModel.findByIdAndUpdate(user._id, updates);
            const remaining = MAX_LOGIN_ATTEMPTS - attemptCount;
            throw new HttpError(401, `Invalid credentials. ${remaining} attempts remaining before lockout.`);
        }

        // Check password expiry
        if (user.passwordCreatedAt && isPasswordExpired(user.passwordCreatedAt)) {
            throw new HttpError(403, "Password has expired. Please reset your password.");
        }

        // Check if MFA is enabled - require token
        if (user.mfaEnabled && user.mfaSecret) {
            // If no MFA token provided, signal that MFA is required
            if (!(data as any).mfaToken) {
                return {
                    mfaRequired: true,
                    tempToken: jwt.sign({ id: user._id, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' }),
                    message: "MFA verification required"
                };
            }
            // Verify MFA token
            const isMfaValid = verifyMfaToken(user.mfaSecret, (data as any).mfaToken);
            if (!isMfaValid) {
                throw new HttpError(401, "Invalid MFA token");
            }
        }

        // Successful login - reset attempts and update tracking
        await UserModel.findByIdAndUpdate(user._id, {
            loginAttempts: 0,
            lockUntil: undefined,
            lastLoginAt: new Date(),
            lastLoginIP: clientIp || 'unknown'
        });

        // Clear IP-based failed attempts on successful login
        await clearFailedAttempts(clientIp || 'unknown');

        // Decrypt phone_number for client display
        let decryptedPhone = user.phone_number;
        try {
            if (user.phone_number) {
                decryptedPhone = decryptData(user.phone_number);
            }
        } catch (e) {
            // If decryption fails, phone might not be encrypted (old data)
            decryptedPhone = user.phone_number;
        }

        // Session binding: include user-agent fingerprint in JWT payload
        // This prevents stolen tokens from being used on different devices
        const crypto = await import('crypto');
        const uaFingerprint = userAgent
            ? crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16)
            : undefined;

        const payload = {
            id: user._id,
            email: user.email,
            phone_number: decryptedPhone,
            role: user.role,
            uaFp: uaFingerprint // User-agent fingerprint for session binding
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        // Return user object with decrypted phone for frontend
        const userResponse = user.toObject ? user.toObject() : { ...user };
        userResponse.phone_number = decryptedPhone;

        return { user: userResponse, token };
    }

    // ========== UPDATE USER ==========
    async updateUser(userId: string, data: UpdateUserDto) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (data.email && user.email !== data.email) {
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if (emailExists) {
                throw new HttpError(409, "Email already exists");
            }
        }
        if (data.password) {
            const hashedPassword = await bcryptjs.hash(data.password, 12);
            data.password = hashedPassword;
        }
        // Encrypt phone_number if being updated
        if (data.phone_number) {
            data.phone_number = encryptData(data.phone_number);
        }
        const updatedUser = await userRepository.updateUserById(userId, data);

        // Decrypt phone_number in response for frontend display
        if (updatedUser && updatedUser.phone_number) {
            const responseUser = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
            try {
                responseUser.phone_number = decryptData(updatedUser.phone_number);
            } catch (e) {
                responseUser.phone_number = updatedUser.phone_number;
            }
            return responseUser;
        }
        return updatedUser;
    }

    // ========== ADMIN LOGIN ==========
    async loginAdmin(data: AdminLoginDTO, clientIp?: string) {
        const user = await userRepository.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            throw new HttpError(423, `Account is locked. Try again in ${remainingMinutes} minutes.`);
        }

        const validPassword = await bcryptjs.compare(data.password, user.password as string);
        if (!validPassword) {
            // Increment failed login attempts
            const updates: any = {
                loginAttempts: (user.loginAttempts || 0) + 1,
                $push: {
                    failedLoginAttempts: {
                        timestamp: new Date(),
                        ip: clientIp || 'unknown'
                    }
                }
            };
            if ((user.loginAttempts || 0) + 1 >= MAX_LOGIN_ATTEMPTS) {
                updates.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
                await UserModel.findByIdAndUpdate(user._id, updates);
                throw new HttpError(423, `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts.`);
            }
            await UserModel.findByIdAndUpdate(user._id, updates);
            throw new HttpError(401, "Invalid credentials");
        }

        // require that both request and DB indicate admin
        if (data.role !== 'admin' || user.role !== 'admin') {
            throw new HttpError(403, "Forbidden, Admins only");
        }

        // Check MFA for admin
        if (user.mfaEnabled && user.mfaSecret) {
            if (!(data as any).mfaToken) {
                return {
                    mfaRequired: true,
                    tempToken: jwt.sign({ id: user._id, mfaPending: true }, JWT_SECRET, { expiresIn: '5m' }),
                    message: "MFA verification required"
                };
            }
            const isMfaValid = verifyMfaToken(user.mfaSecret, (data as any).mfaToken);
            if (!isMfaValid) {
                throw new HttpError(401, "Invalid MFA token");
            }
        }

        // Reset login attempts on success
        await UserModel.findByIdAndUpdate(user._id, {
            loginAttempts: 0,
            lockUntil: undefined,
            lastLoginAt: new Date(),
            lastLoginIP: clientIp || 'unknown'
        });

        // Decrypt phone_number for client display
        let adminDecryptedPhone = user.phone_number;
        try {
            if (user.phone_number) {
                adminDecryptedPhone = decryptData(user.phone_number);
            }
        } catch (e) {
            adminDecryptedPhone = user.phone_number;
        }

        const payload = {
            id: user._id,
            email: user.email,
            phone_number: adminDecryptedPhone,
            role: user.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        const adminUserResponse = user.toObject ? user.toObject() : { ...user };
        adminUserResponse.phone_number = adminDecryptedPhone;

        return { user: adminUserResponse, token };
    }

    // ========== CHANGE PASSWORD (with history check) ==========
    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // OAuth-only users cannot change password (they don't have one)
        if (!user.password) {
            throw new HttpError(400, "Cannot change password for OAuth accounts. Use Google Sign-In.");
        }

        // Verify current password
        const validCurrent = await bcryptjs.compare(currentPassword, user.password as string);
        if (!validCurrent) {
            throw new HttpError(401, "Current password is incorrect");
        }

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(newPassword, user.email);
        if (!passwordValidation.isValid) {
            throw new HttpError(400, `Password policy violation: ${passwordValidation.errors.join(', ')}`);
        }

        // Check against previous passwords (prevent reuse of last 5)
        const previousPasswords = user.previousPasswords || [];
        for (const prev of previousPasswords) {
            const isReused = await bcryptjs.compare(newPassword, prev.hash);
            if (isReused) {
                throw new HttpError(400, "Cannot reuse any of your last 5 passwords");
            }
        }

        // Hash new password
        const hashedNew = await bcryptjs.hash(newPassword, 12);

        // Update password and history (keep only last 5)
        const updatedHistory = [...previousPasswords, { hash: hashedNew, changedAt: new Date() }].slice(-5);

        await UserModel.findByIdAndUpdate(userId, {
            password: hashedNew,
            previousPasswords: updatedHistory,
            passwordCreatedAt: new Date()
        });

        return { message: "Password changed successfully", strength: passwordValidation.strength };
    }

    // ========== MFA SETUP ==========
    async setupMfa(userId: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (user.mfaEnabled) {
            throw new HttpError(400, "MFA is already enabled");
        }

        const secret = generateMfaSecret(user.email);
        // Store secret temporarily (not enabled until verified)
        await UserModel.findByIdAndUpdate(userId, { mfaSecret: secret.base32 });

        const qrCode = await generateQRCode(secret.otpauth_url!);

        return {
            secret: secret.base32,
            qrCode,
            otpauthUrl: secret.otpauth_url
        };
    }

    // ========== VERIFY MFA SETUP ==========
    async verifyMfaSetup(userId: string, token: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (!user.mfaSecret) {
            throw new HttpError(400, "MFA setup not initiated. Call setup first.");
        }

        const isValid = verifyMfaToken(user.mfaSecret, token);
        if (!isValid) {
            throw new HttpError(400, "Invalid MFA token. Please try again.");
        }

        // Enable MFA
        await UserModel.findByIdAndUpdate(userId, { mfaEnabled: true });
        return { message: "MFA enabled successfully" };
    }

    // ========== DISABLE MFA ==========
    async disableMfa(userId: string, token: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if (!user.mfaEnabled || !user.mfaSecret) {
            throw new HttpError(400, "MFA is not enabled");
        }

        // Verify token before disabling
        const isValid = verifyMfaToken(user.mfaSecret, token);
        if (!isValid) {
            throw new HttpError(401, "Invalid MFA token");
        }

        await UserModel.findByIdAndUpdate(userId, {
            mfaEnabled: false,
            mfaSecret: undefined
        });
        return { message: "MFA disabled successfully" };
    }

    // ========== VERIFY MFA ON LOGIN ==========
    async verifyMfaLogin(tempToken: string, mfaToken: string) {
        try {
            const decoded = jwt.verify(tempToken, JWT_SECRET) as any;
            if (!decoded.mfaPending) {
                throw new HttpError(400, "Invalid token");
            }

            const user = await UserModel.findById(decoded.id);
            if (!user || !user.mfaSecret) {
                throw new HttpError(404, "User not found");
            }

            const isValid = verifyMfaToken(user.mfaSecret, mfaToken);
            if (!isValid) {
                throw new HttpError(401, "Invalid MFA token");
            }

            // Issue full access token
            const payload = {
                id: user._id,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

            // Update login tracking
            await UserModel.findByIdAndUpdate(user._id, {
                loginAttempts: 0,
                lockUntil: undefined,
                lastLoginAt: new Date()
            });

            return { user, token };
        } catch (err: any) {
            if (err instanceof HttpError) throw err;
            throw new HttpError(401, "Invalid or expired temp token");
        }
    }

    // ========== EMAIL OTP VERIFICATION ==========
    async sendEmailOTP(userId: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await UserModel.findByIdAndUpdate(userId, {
            emailOTP: otp,
            emailOTPExpire: otpExpire
        });

        return { otp, email: user.email }; // In production, send via email transporter
    }

    async verifyEmailOTP(userId: string, otp: string) {
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (!user.emailOTP || !user.emailOTPExpire) {
            throw new HttpError(400, "No OTP generated. Request a new one.");
        }

        if (new Date() > user.emailOTPExpire) {
            throw new HttpError(400, "OTP has expired. Request a new one.");
        }

        if (user.emailOTP !== otp) {
            throw new HttpError(400, "Invalid OTP");
        }

        await UserModel.findByIdAndUpdate(userId, {
            emailVerified: true,
            emailOTP: undefined,
            emailOTPExpire: undefined
        });

        return { message: "Email verified successfully" };
    }
}
