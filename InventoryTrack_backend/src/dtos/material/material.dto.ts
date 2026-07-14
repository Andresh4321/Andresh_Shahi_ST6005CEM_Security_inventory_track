import z from "zod";
export const CreateMaterialDTO = z.object({
    name: z.string().min(3).max(50),
    unit: z.string().min(1).max(20),
    unit_price: z.number().positive(),
    minimum_stock: z.number().positive(),
    description: z.string().optional(),
});
export type CreateMaterialDTO = z.infer<typeof CreateMaterialDTO>;

export const GetMaterialbynameDTO = z.object({
    name: z.string().min(3).max(50),
});
export type GetMaterialbynameDTO = z.infer<typeof GetMaterialbynameDTO>;

export const GetMaterialbyIdDTO = z.object({
    id: z.string(),
});
export type GetMaterialbyIdDTO = z.infer<typeof GetMaterialbyIdDTO>;

export const deleteMaterialDTO = z.object({
    id: z.string(),
});
export type deleteMaterialDTO = z.infer<typeof deleteMaterialDTO>;

export const UpdateMaterialDTO = z.object({
    id: z.string(),
    name: z.string().min(3).max(50).optional(),
    unit: z.string().min(1).max(20).optional(),
    unit_price: z.number().positive().optional(),
    minimum_stock: z.number().positive().optional(),
    description: z.string().optional(),
});
export type UpdateMaterialDTO = z.infer<typeof UpdateMaterialDTO>;