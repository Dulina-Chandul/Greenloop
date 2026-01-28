import jwt from "jsonwebtoken";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/session/session.model";
import UserModel from "../models/user/user.model";
import VerificationCodeModel from "../models/verification/verification.model";
import { oneYearFromNow } from "../utils/date";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import appAssert from "../utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";

type createAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

type loginParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: createAccountParams) => {
  const existingUser = await UserModel.exists({ email: data.email });

  appAssert(!existingUser, CONFLICT, "Email already exists");

  //* Create User
  const user = await UserModel.create(data);

  //* Create Verification Code
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const session = await SessionModel.create({
    userId: user._id,
    ...(data.userAgent && { userAgent: data.userAgent }),
  });

  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
      audience: ["user"],
    },
  );

  const accessToken = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
      audience: ["user"],
    },
  );

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (data: loginParams) => {
  //* Find the user by Email
  const user = await UserModel.findOne({ email: data.email });

  appAssert(user, UNAUTHORIZED, "Invalid credentials");

  //* Compare the password
  const isPasswordValid = await user.comparePassword(data.password);

  appAssert(isPasswordValid, UNAUTHORIZED, "Invalid credentials");

  //* Create Session
  const session = await SessionModel.create({
    userId: user._id,
    ...(data.userAgent && { userAgent: data.userAgent }),
  });

  //* Create Refresh Token
  const refreshToken = jwt.sign(
    { sessionId: session._id },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
      audience: ["user"],
    },
  );

  //* Create Access Token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
      audience: ["user"],
    },
  );

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};
