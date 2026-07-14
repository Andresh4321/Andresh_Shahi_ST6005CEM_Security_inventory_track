
import { z } from "zod";

export const changePriceDTO = z.object({
    id: z.string(),
    price: z.number().positive(),
});

export type changePriceDTO = z.infer<typeof changePriceDTO>;
