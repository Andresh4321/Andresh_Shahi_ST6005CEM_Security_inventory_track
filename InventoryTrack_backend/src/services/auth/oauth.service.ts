import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config';
import { HttpError } from '../../errors/http_error';
import { UserModel, IUser } from '../../models/auth/user.models';

interface GoogleTokenPayload {
    sub: string;        // Google user ID
    email: string;
    email_verified: boolean;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
}

export class OAuthService {

    /**
     * Verify Google ID token by decoding it and validating with Google's tokeninfo endpoint.
     * In production, use Google's official library. For this implementation, we verify
     * the token by calling Google's tokeninfo API.
     */
    async verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
        try {
            // Verify token with Google's tokeninfo endpoint
            const response = await fetch(
                `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
            );

            if (!response.ok) {
                throw new HttpError(401, 'Invalid Google token');
            }

            const payload = await response.json() as any;

            // Verify the token is for our app
            const validClientIds = [
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_ID_WEB
            ].filter(Boolean);

            if (validClientIds.length > 0 && !validClientIds.includes(payload.aud)) {
                throw new HttpError(401, 'Token not issued for this application');
            }

            // Check email is verified
            if (payload.email_verified !== 'true' && payload.email_verified !== true) {
                throw new HttpError(401, 'Google email not verified');
            }

            return {
                sub: payload.sub,
                email: payload.email,
                email_verified: true,
                name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
                picture: payload.picture,
                given_name: payload.given_name,
                family_name: payload.family_name
            };
        } catch (err: any) {
            if (err instanceof HttpError) throw err;
            throw new HttpError(401, 'Failed to verify Google token');
        }
    }

    /**
     * Handle Google OAuth login/registration.
     * If user exists with this Google ID, log them in.
     * If user exists with same email (local account), link Google ID.
     * If new user, create account.
     */
    async googleLogin(idToken: string, clientIp?: string): Promise<{ user: any; token: string; isNewUser: boolean }> {
        const googlePayload = await this.verifyGoogleToken(idToken);

        // Check if user already exists with this Google ID
        let user = await UserModel.findOne({ googleId: googlePayload.sub });

        let isNewUser = false;

        if (!user) {
            // Check if user exists with same email (existing local account)
            user = await UserModel.findOne({ email: googlePayload.email });

            if (user) {
                // Link Google account to existing local account
                user.googleId = googlePayload.sub;
                if (!user.profileImage && googlePayload.picture) {
                    user.profileImage = googlePayload.picture;
                }
                user.emailVerified = true; // Google verified the email
                await user.save();
            } else {
                // Create new user from Google data
                const newUser = new UserModel({
                    fullname: googlePayload.name,
                    email: googlePayload.email,
                    googleId: googlePayload.sub,
                    authProvider: 'google',
                    profileImage: googlePayload.picture || '',
                    emailVerified: true,
                    role: 'user',
                    loginAttempts: 0,
                    mfaEnabled: false
                });

                user = await newUser.save();
                isNewUser = true;
            }
        }

        // Update login tracking
        await UserModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
            lastLoginIP: clientIp || 'unknown',
            loginAttempts: 0,
            lockUntil: undefined
        });

        // Generate JWT
        const payload = {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number || '',
            role: user.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        // Prepare user response
        const userResponse = user.toObject ? user.toObject() : { ...user };

        return { user: userResponse, token, isNewUser };
    }
}
