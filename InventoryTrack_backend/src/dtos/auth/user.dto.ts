import z from "zod";

// Register schema
export const RegisterDTO = z.object({
  fullname: z.string().optional(),
  email: z.string().email(),
  phone_number: z.string().min(3).max(20),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).default("user"),
  profileImage: z.string().optional()
});
export type RegisterDTO = z.infer<typeof RegisterDTO>;

// Login schema
export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
export type LoginDto = z.infer<typeof LoginDto>;

// Admin login schema (requires role 'admin')
export const AdminLoginDto = LoginDto.extend({
    email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin"])
});
export type AdminLoginDto = z.infer<typeof AdminLoginDto>;
// add: explicit type alias to avoid value/type collision when importing
export type AdminLoginDTO = z.infer<typeof AdminLoginDto>;

// Update user schema
export const UpdateUserDto = z.object({
  fullname: z.string().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().min(3).max(20).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["user", "admin"]).optional(),
  profileImage: z.string().optional()
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;





