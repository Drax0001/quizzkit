import { z } from "zod";

export const updateProfileSchema = z.object({
  avatar: z.string().max(8).optional(),
  themeColor: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  notifyDuel: z.boolean().optional(),
  notifyQuiz: z.boolean().optional(),
  notifyApp: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
