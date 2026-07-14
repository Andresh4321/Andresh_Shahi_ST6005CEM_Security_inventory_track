import { RegisterDTO, LoginDto , UpdateUserDto, AdminLoginDto } from "../../dtos/auth/user.dto";
import z from "zod";
import { Request, Response } from "express";
import { AuthService } from "../../services/auth/auth.service";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/auth/user.models";
let authService = new AuthService();
export class AuthController{
    async registerUser(req: Request, res: Response){
        try{
            const parsedData = RegisterDTO.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const newUser = await authService.registerUser(parsedData.data);
            return res.status(201).json(
                { success: true, data: newUser, message: "Registered Success" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async loginUser(req: Request, res: Response){
        try{
            // If client included role: 'admin', delegate to admin login handler
            if ((req.body as any)?.role === 'admin') {
                return this.loginAdmin(req, res);
            }
            const parsedData = LoginDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const { token , user } = await authService.loginUser(parsedData.data);
            return res.status(200).json(
                { success: true, data: user, token, message: "Login success" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }
    async loginAdmin(req: Request, res: Response){
        try{
            const parsed = AdminLoginDto.safeParse(req.body);
            if(!parsed.success){
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }
            const { user, token } = await authService.loginAdmin(parsed.data);
            return res.status(200).json({ success: true, data: user, token, message: "Admin login success" });
        }catch(error: Error | any){
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

    const parsed = UpdateUserDto.safeParse(req.body);
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

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;

            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
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

            res.status(200).json({ success: true, message: "Password reset email sent" });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ success: false, message: "Error sending reset email" });
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

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            res.status(200).json({ success: true, message: "Password has been reset successfully" });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ success: false, message: "Error resetting password" });
        }
    }

}

