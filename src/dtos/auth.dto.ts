import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

const signupPasswordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
    message: "Password must not exceed 72 bytes",
  });

export const signupSchema = z
  .object({
    email: emailSchema,
    username: z.string().trim().min(1).max(50),
    password: signupPasswordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(72),
  })
  .strict();

export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
