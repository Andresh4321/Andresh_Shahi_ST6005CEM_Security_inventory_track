import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../../types/auth/user.type";
const UserSchema: Schema = new Schema(
    {
        fullname: { type: String },
        email: { type: String, required: true, unique: true },
        phone_number: { type: String, unique: true, sparse: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        profileImage: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },

    },
    {
        timestamps: true, 
    }
)

// Add virtual for id
UserSchema.virtual('id').get(function(this: any) {
    return this._id.toString();
});

export interface IUser extends UserType, Document{ 
    _id: mongoose.Types.ObjectId;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
}
export const UserModel = mongoose.model<IUser>('User', UserSchema);
