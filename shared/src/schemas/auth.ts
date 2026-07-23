import { z } from "zod";

export const emailSchema = z.email("Enter a valid email");

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Username is required")
  .max(20, "Username must be 20 characters or less");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
