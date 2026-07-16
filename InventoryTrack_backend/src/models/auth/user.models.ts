import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../../types/auth/user.type";

const UserSchema: Schema = new Schema(
    {
        fullname: { type: String },
        email: { type: String, required: true, unique: true },
        phone_number: { type: String, unique: true, sparse: true },
        password: { type: String, required: function(this: any) { return this.authProvider === 'local'; } },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        profileImage: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },

        // Password history - store last 5 passwords to prevent reuse
        previousPasswords: [{
            hash: { type: String },
            changedAt: { type: Date, default: Date.now }
        }],
        // Track password age for expiry policy
        passwordCreatedAt: { type: Date, default: Date.now },

        // Account lockout fields
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date },

        // MFA (TOTP) fields
        mfaSecret: { type: String },
        mfaEnabled: { type: Boolean, default: false },

        // Email verification
        emailVerified: { type: Boolean, default: false },
        emailOTP: { type: String },
        emailOTPExpire: { type: Date },

        // OAuth fields
        googleId: { type: String, unique: true, sparse: true },
        authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

        // Login tracking
        lastLoginAt: { type: Date },
        lastLoginIP: { type: String },
        failedLoginAttempts: [{
            timestamp: { type: Date, default: Date.now },
            ip: { type: String }
        }]
    },
    {
        timestamps: true,
    }
);

// Add virtual for id
UserSchema.virtual('id').get(function(this: any) {
    return this._id.toString();
});

// Virtual to check if account is currently locked
UserSchema.virtual('isLocked').get(function(this: any) {
    return !!(this.lockUntil && this.lockUntil > new Date());
});

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    previousPasswords?: { hash: string; changedAt: Date }[];
    passwordCreatedAt?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    mfaSecret?: string;
    mfaEnabled: boolean;
    emailVerified: boolean;
    emailOTP?: string;
    emailOTPExpire?: Date;
    googleId?: string;
    authProvider: 'local' | 'google';
    lastLoginAt?: Date;
    lastLoginIP?: string;
    failedLoginAttempts?: { timestamp: Date; ip: string }[];
    isLocked?: boolean;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
