import { z } from "zod";

export const CreateIngredientDTO = z.object({
    product_id: z.string(),
    material_id: z.string(),
    quantity: z.number().positive(),
});
export type CreateIngredientDTO = z.infer<typeof CreateIngredientDTO>;

export const UpdateIngredientDTO = z.object({
    id: z.string(),
    product_id: z.string().optional(),
    material_id: z.string().optional(),
    quantity: z.number().positive().optional(),
});
export type UpdateIngredientDTO = z.infer<typeof UpdateIngredientDTO>;

export const deleteIngredientDTO = z.object({
    id: z.string(),
});
export type deleteIngredientDTO = z.infer<typeof deleteIngredientDTO>;

export const GetIngredientByIdDTO = z.object({
    id: z.string(),
});
export type GetIngredientByIdDTO = z.infer<typeof GetIngredientByIdDTO>;


export const GetIngredientsByProductIdDTO = z.object({
    product_id: z.string(),
});
export type GetIngredientsByProductIdDTO = z.infer<typeof GetIngredientsByProductIdDTO>;

export const GetIngredientsByNameDTO = z.object({
    name: z.string().min(3).max(50),
});
export type GetIngredientsByNameDTO = z.infer<typeof GetIngredientsByNameDTO>;