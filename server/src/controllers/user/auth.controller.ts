import catchErrors from "../../utils/catchErrors";
import { CREATED, OK } from "../../constants/http";
import { createAccount, loginUser } from "../../services/auth.service";
import { setAuthCookies } from "../../utils/cookies";
import { loginSchema, registerSchema } from "../../config/auth.schemas";

export const registerHandler = catchErrors(async (req, res) => {
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

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken, refreshToken } = await loginUser(request);

  return setAuthCookies({ res, accessToken, refreshToken }).status(OK).json({
    message: "User logged in successfully",
    data: {
      user,
    },
  });
});
