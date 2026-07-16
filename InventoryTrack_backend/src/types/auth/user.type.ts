import z from "zod";

export const userSchema = z.object({
    fullname: z.string().optional(),
    email: z.email(),
    phone_number: z.string().min(1).max(20).optional(),
    password: z.string().min(6).optional(), // Optional for OAuth users
    role: z.enum(['user', 'admin']).default('user'),
    profileImage: z.string().optional(),
    googleId: z.string().optional(),
    authProvider: z.enum(['local', 'google']).default('local')
});
export type UserType = z.infer<typeof userSchema>;