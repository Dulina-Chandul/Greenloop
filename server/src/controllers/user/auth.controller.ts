import z from "zod";
import catchErrors from "../../utils/catchErrors";
import { OK } from "../../constants/http";

const registerSchema = z
  .object({
    email: z.string().email().min(5).max(255),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerController = catchErrors(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  return res.status(OK).json({
    message: "User registered successfully",
    data: request,
  });
});
