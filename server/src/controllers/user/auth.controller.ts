import z from "zod";
import catchErrors from "../../utils/catchErrors";
import { CREATED, OK } from "../../constants/http";
import { createAccount } from "../../services/auth.service";
import { setAuthCookies } from "../../utils/cookies";

const registerSchema = z
  .object({
    email: z.string().email().min(5).max(255),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    userAgent: z.string().default("unknown"),
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

  const { user, accessToken, refreshToken } = await createAccount(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json({
      message: "User registered successfully",
      data: {
        user,
      },
    });
});
