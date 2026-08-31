import { z } from "zod";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.email(),
  password: z.string().min(8),
});
export type SignUpInput = z.infer<typeof signUpSchema>;
