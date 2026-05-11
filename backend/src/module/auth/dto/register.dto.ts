import * as z from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(3, "First Name must be min 3 characters long.")
    .max(100),
  lastName: z.string().min(3).max(100).optional(),
  email: z.string().email().max(322),
  password: z.string().min(3, "password must be min 3 characters long"),
  avatar: z.string().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
