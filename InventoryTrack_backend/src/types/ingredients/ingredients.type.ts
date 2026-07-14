import e from "express";
import { z } from "zod";

export const ingredientsSchema = z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().positive(),
});
export type IngredientsType = z.infer<typeof ingredientsSchema>;
