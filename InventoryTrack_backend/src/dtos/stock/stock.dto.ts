import z from "zod";
export const GetAllStockDTO = z.object({
    page: z.number().positive().optional(),
    limit: z.number().positive().optional(),
});
export type GetAllStockDTO = z.infer<typeof GetAllStockDTO>;

export const updateStockDTO = z.object({
    id: z.string(),
    material_id: z.string().optional(),
    quantity: z.number().positive().optional(),
    description: z.string().optional(),
});
export type updateStockDTO = z.infer<typeof updateStockDTO>;

export const deleteStockDTO = z.object({
    id: z.string(),
});
export type deleteStockDTO = z.infer<typeof deleteStockDTO>;

export const GetStockByMaterialIdDTO = z.object({
    material_id: z.string(),
});

export type GetStockByMaterialIdDTO = z.infer<typeof GetStockByMaterialIdDTO>;

export const GetStockByIdDTO = z.object({
    id: z.string(),
});
export type GetStockByIdDTO = z.infer<typeof GetStockByIdDTO>;

export const CreateStockDTO = z.object({
    material_id: z.string(),
    quantity: z.number().positive(),
    description: z.string().optional(),
});
export type CreateStockDTO = z.infer<typeof CreateStockDTO>;
