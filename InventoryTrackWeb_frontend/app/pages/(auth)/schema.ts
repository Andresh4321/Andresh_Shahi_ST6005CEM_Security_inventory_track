import z from "zod";

export const loginSchema = z.object({
    email: z.email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "Minimum 6 characters" }),
    mfaToken: z.string().optional(),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    fullname: z.string().min(2, { message: "Enter your name" }),
    email: z.email({ message: "Enter a valid email" }),
    phone_number: z
        .string()
        .min(10, "Enter phone number")
        .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(8, { message: "Confirm your password" }),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type RegisterData = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Enter current password"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Must contain at least one special character"),
    confirmNewPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
