import z from "zod";

export const userSchema = z.object({
    fullname: z.string().optional(),
    email: z.email(),
    phone_number: z.string().min(3).max(20),
    password: z.string().min(6),
    role: z.enum(['user', 'admin']).default('user'),
    profileImage: z.string().optional() // ✅ ADD THIS
});
export type UserType = z.infer<typeof userSchema>;