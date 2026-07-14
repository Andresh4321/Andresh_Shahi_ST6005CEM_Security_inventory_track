
import { z } from "zod";
export const stockSchema = z.object({
    id: z.string(),
    material_id: z.string(),
    quantity: z.number().positive(),
    description: z.string().optional(),
});
export type StockType = z.infer<typeof stockSchema>;

