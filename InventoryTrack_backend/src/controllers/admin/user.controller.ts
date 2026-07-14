import { RegisterDTO, LoginDto, UpdateUserDto } from "../../dtos/auth/user.dto";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.service";
import mongoose from "mongoose";

let adminUserService = new AdminUserService();

export class AdminUserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const parsedData = RegisterDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            if(req.file){   
                parsedData.data.profileImage = `/uploads/${req.file.filename}`;
            }
            const userData: RegisterDTO = parsedData.data;
            const newUser = await adminUserService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await adminUserService.getAllUsers(page, limit);

        return res.status(200).json({
            success: true,
            data: result.users,
            total: result.total,
            page,
            totalPages: Math.ceil(result.total / limit),
            message: "Users Retrieved Successfully",
        });

    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}


 async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            // Ensure req.body is at least an object
            const bodyData: any = req.body || {};

            // Merge uploaded image if exists
            if (req.file) {
                bodyData.profileImage = `/uploads/${req.file.filename}`;
            }

            // Validate with Zod
            const parsedData = UpdateUserDto.safeParse(bodyData);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            // Call service to update user
            const updatedUser = await adminUserService.updateUser(
                req.params.id,
                parsedData.data as UpdateUserDto
            );

            return res.status(200).json({
                success: true,
                message: "User Updated",
                data: updatedUser
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }


    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).json({ success: false, message: "Invalid user id" });
            }
            const deleted = await adminUserService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json(
                    { success: false, message: "User not found" }
                );
            }
            return res.status(200).json(
                { success: true, message: "User Deleted" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).json({ success: false, message: "Invalid user id" });
            }
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "Single User Retrieved" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async updateUserImage(req: Request, res: Response) {
    try {
        const userId = req.params.id;
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        // Check if a file is provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            });
        }

        // Build the path to save in DB
        const imagePath = `/uploads/${req.file.filename}`;

        // Update only the profileImage field
        const updatedUser = await adminUserService.updateUser(userId, {
            profileImage: imagePath
        });

        return res.status(200).json({
            success: true,
            message: "Profile image updated",
            data: updatedUser
        });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}



}