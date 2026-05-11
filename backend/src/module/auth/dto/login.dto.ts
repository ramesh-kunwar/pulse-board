import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(322),
  password: z.string().min(3, "password must be min 3 characters long"),
});

export type LoginDto = z.infer<typeof loginSchema>;
