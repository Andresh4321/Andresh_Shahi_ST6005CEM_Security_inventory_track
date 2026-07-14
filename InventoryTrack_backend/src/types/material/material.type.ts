import z from "zod";

export const materialSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(50),
    unit: z.string().min(1).max(20),
    unit_price: z.number().positive(),
    minimum_stock: z.number().positive(),
     description: z.string().optional(),
});
export type MaterialType = z.infer<typeof materialSchema>;
