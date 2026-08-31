import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(280).optional(),
  color: z.string().optional(),
  icon: z.string().max(8).optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
