import { RegisterDTO, LoginDto, UpdateUserDto, AdminLoginDto } from "../../dtos/auth/user.dto";
import z from "zod";
import { Request, Response } from "express";
import { AuthService } from "../../services/auth/auth.service";
import { OAuthService } from "../../services/auth/oauth.service";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/auth/user.models";

let authService = new AuthService();
let oauthService = new OAuthService();

export class AuthController {
    async registerUser(req: Request, res: Response) {
        try {
            const parsedData = RegisterDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const newUser = await authService.registerUser(parsedData.data);
            return res.status(201).json(
                { success: true, data: newUser, message: "Registered Success" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            // If client included role: 'admin', delegate to admin login handler
            if ((req.body as any)?.role === 'admin') {
                return this.loginAdmin(req, res);
            }
            const parsedData = LoginDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            const result = await authService.loginUser(parsedData.data, clientIp, userAgent);

            // Check if MFA is required
            if ((result as any).mfaRequired) {
                return res.status(200).json({
                    success: true,
                    mfaRequired: true,
                    tempToken: (result as any).tempToken,
                    message: (result as any).message
                });
            }

            return res.status(200).json(
                { success: true, data: (result as any).user, token: (result as any).token, message: "Login success" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async loginAdmin(req: Request, res: Response) {
        try {
            const parsed = AdminLoginDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
            const result = await authService.loginAdmin(parsed.data, clientIp);

            // Check if MFA is required
            if ((result as any).mfaRequired) {
                return res.status(200).json({
                    success: true,
                    mfaRequired: true,
                    tempToken: (result as any).tempToken,
                    message: (result as any).message
                });
            }

            return res.status(200).json({ success: true, data: (result as any).user, token: (result as any).token, message: "Admin login success" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // MFA verification for login
    async verifyMfaLogin(req: Request, res: Response) {
        try {
            const { tempToken, mfaToken } = req.body;
            if (!tempToken || !mfaToken) {
                return res.status(400).json({ success: false, message: "tempToken and mfaToken are required" });
            }
            const result = await authService.verifyMfaLogin(tempToken, mfaToken);
            return res.status(200).json({ success: true, data: result.user, token: result.token, message: "MFA verified, login success" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // Change password with history check
    async changePassword(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
            }
            const result = await authService.changePassword((req as any).user._id.toString(), currentPassword, newPassword);
            return res.status(200).json({ success: true, ...result });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // MFA setup
    async setupMfa(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const result = await authService.setupMfa((req as any).user._id.toString());
            return res.status(200).json({ success: true, data: result, message: "Scan QR code with authenticator app" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // Verify MFA setup
    async verifyMfaSetup(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ success: false, message: "MFA token is required" });
            }
            const result = await authService.verifyMfaSetup((req as any).user._id.toString(), token);
            return res.status(200).json({ success: true, ...result });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // Disable MFA
    async disableMfa(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ success: false, message: "MFA token is required to disable MFA" });
            }
            const result = await authService.disableMfa((req as any).user._id.toString(), token);
            return res.status(200).json({ success: true, ...result });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // Send email OTP
    async sendEmailOTP(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const result = await authService.sendEmailOTP((req as any).user._id.toString());

            // Send OTP via email
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: `"InventoryTrack" <${process.env.EMAIL_USER}>`,
                to: result.email,
                subject: "Email Verification OTP - InventoryTrack",
                html: `<p>Your email verification OTP is: <strong>${result.otp}</strong></p>
                       <p>This OTP will expire in 10 minutes.</p>`
            });

            return res.status(200).json({ success: true, message: "OTP sent to your email" });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // Verify email OTP
    async verifyEmailOTP(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({ success: false, message: "OTP is required" });
            }
            const result = await authService.verifyEmailOTP((req as any).user._id.toString(), otp);
            return res.status(200).json({ success: true, ...result });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async whoAmI(req: Request, res: Response) {
        try {
            return res.status(200).json({ success: true, data: (req as any).user });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
        }
    }

    async uploadProfilePhoto(req: Request, res: Response) {
        try {
            if (!req.file)
                return res.status(400).json({ message: "No file uploaded" });

            const imagePath = `/uploads/${req.file.filename}`;

            await authService.updateUser((req as any).user!._id.toString(), {
                profileImage: imagePath,
            });

            return res.status(200).json({
                success: true,
                imageUrl: imagePath,
            });
        } catch (err: any) {
            return res.status(500).json({ message: err.message });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            if (!(req as any).user) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const userId = req.params.id;
            if (userId !== (req as any).user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });

            // For multipart/form-data, body fields come as strings
            const bodyData = { ...req.body };

            // Remove empty/undefined fields
            Object.keys(bodyData).forEach(key => {
                if (bodyData[key] === undefined || bodyData[key] === '') {
                    delete bodyData[key];
                }
            });

            const parsed = UpdateUserDto.safeParse(bodyData);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            if (req.file) parsed.data.profileImage = `/uploads/${req.file.filename}`;

            // Prevent role elevation
            if ((parsed.data as any).role) delete (parsed.data as any).role;

            const updated = await authService.updateUser(userId, parsed.data);
            return res.status(200).json({ success: true, data: updated, message: 'Profile updated' });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Internal Server Error' });
        }
    }

    // Google OAuth login
    async googleLogin(req: Request, res: Response) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ success: false, message: "Google ID token is required" });
            }

            const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
            const result = await oauthService.googleLogin(idToken, clientIp);

            return res.status(200).json({
                success: true,
                data: result.user,
                token: result.token,
                isNewUser: result.isNewUser,
                message: result.isNewUser ? "Account created with Google" : "Google login successful"
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Google login failed"
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;

            // SECURITY FIX: Always return the same generic response regardless of whether
            // the email exists. This prevents email enumeration attacks where attackers
            // use different response messages to determine valid accounts.
            const genericResponse = { success: true, message: "If an account with that email exists, a password reset link has been sent." };

            if (!email || typeof email !== 'string') {
                return res.status(200).json(genericResponse);
            }

            const user = await UserModel.findOne({ email });
            if (!user) {
                // Do NOT reveal that the user doesn't exist — return same response
                return res.status(200).json(genericResponse);
            }

            const resetToken = crypto.randomBytes(32).toString("hex");
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await user.save();

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

            await transporter.sendMail({
                to: user.email,
                subject: "Password Reset Request",
                html: `<p>Hi ${user.fullname},</p>
                       <p>You requested a password reset. Click the link below to reset your password:</p>
                       <a href="${resetUrl}">${resetUrl}</a>
                       <p>This link will expire in 15 minutes.</p>`
            });

            res.status(200).json(genericResponse);
        } catch (err: any) {
            console.error(err);
            // Even on error, return generic response to prevent information leakage
            res.status(200).json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const user = await UserModel.findOne({
                resetPasswordToken: token,
                resetPasswordExpire: { $gt: new Date() },
            });

            if (!user) {
                return res.status(400).json({ success: false, message: "Invalid or expired token" });
            }

            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            user.passwordCreatedAt = new Date();

            // Update password history
            const previousPasswords = user.previousPasswords || [];
            previousPasswords.push({ hash: user.password, changedAt: new Date() });
            user.previousPasswords = previousPasswords.slice(-5); // Keep last 5

            await user.save();

            res.status(200).json({ success: true, message: "Password has been reset successfully" });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ success: false, message: "Error resetting password" });
        }
    }
}
