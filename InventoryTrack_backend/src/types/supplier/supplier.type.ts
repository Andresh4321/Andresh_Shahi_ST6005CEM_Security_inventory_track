import z from "zod";
import { id } from "zod/v4/locales";

export const supplierSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(50),
    email: z.email(),
    contact_number: z.string().min(3).max(20),
    products:z.array(z.string()).optional(), 
});
export type SupplierType = z.infer<typeof supplierSchema>;

export const productSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(50),
});
export type ProductType = z.infer<typeof productSchema>;
// import z from "zod";

// export const userSchema = z.object({
//     fullname: z.string().optional(),
//     email: z.email(),
//     phone_number: z.string().min(3).max(20),
//     password: z.string().min(6),
//     role: z.enum(['user', 'admin']).default('user'),
//     profileImage: z.string().optional() // ✅ ADD THIS
// });
// export type UserType = z.infer<typeof userSchema>;