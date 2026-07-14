import { z } from "zod";

export const billOfMaterialsSchema = z.object({
    id: z.string(),
    product_id: z.string(),
    material_id: z.string(),
    price: z.number().positive(),
});
export type BillOfMaterialsType = z.infer<typeof billOfMaterialsSchema>;
