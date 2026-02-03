import z from "zod";

export const emailSchema = z.string().email().min(1).max(255);
export const passswordSchema = z.string().min(6).max(255);

export const loginSchema = z.object({
  email: z.string().email().min(5).max(255),
  password: z.string().min(6).max(255),
  userAgent: z.string().default("unknown"),
});

export const unifiedLoginSchema = z
  .object({
    email: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Password is required"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Please provide either email or phone number",
    path: ["email"],
  });

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(6).max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verificationCodeSchema = z
  .string()
  .min(1, "Verification code is required")
  .max(24);

export const resetPasswordSchema = z.object({
  verificationCode: verificationCodeSchema,
  password: z
    .string()
    .min(6, "Password must contains at least 6 characters")
    .max(255),
});
