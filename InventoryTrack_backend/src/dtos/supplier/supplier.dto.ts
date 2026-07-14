import z from "zod";

export const CreateSupplierDTO = z.object({
    name: z.string().min(3).max(50),
    email: z.email(),
    contact_number: z.string().min(3).max(20),
    products: z.array(z.string()).optional(), 
});
export type CreateSupplierDTO = z.infer<typeof CreateSupplierDTO>;

export const UpdateSupplierDTO = z.object({
    name: z.string().min(3).max(50).optional(),
    email: z.email().optional(),
    contact_number: z.string().min(3).max(20).optional(),
    products: z.array(z.string()).optional(), 
});
export type UpdateSupplierDTO = z.infer<typeof UpdateSupplierDTO>;

export const SupplierIdDTO = z.object({
    id: z.string(),
});
export type SupplierIdDTO = z.infer<typeof SupplierIdDTO>;


export const SuppliernameDTO = z.object({
    name: z.string().min(3).max(50),
});
export type SuppliernameDTO = z.infer<typeof SuppliernameDTO>;

export const DelteSupplierDTO = z.object({
    id: z.string(),
});
export type DelteSupplierDTO = z.infer<typeof DelteSupplierDTO>;



