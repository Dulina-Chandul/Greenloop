import jwt from "jsonwebtoken";
import VerificationCodeType from "../constants/verificationCodeType";
import SessionModel from "../models/session/session.model";
import UserModel from "../models/user/user.model";
import VerificationCodeModel from "../models/verification/verification.model";
import {
  ONE_DAY_IN_MS,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import { APP_ORIGIN, JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import appAssert from "../utils/appAssert";
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from "../constants/http";
import AppErrorCode from "../constants/appErrorCode";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from "../utils/jwt";
import { NOTFOUND } from "node:dns";
import { sendMail } from "../utils/sendMail";
import { getVerifyEmailTemplate } from "../utils/emailTemplates";

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

  const userID = user._id;

  //* Create Verification Code
  const verificationCode = await VerificationCodeModel.create({
    userId: userID,
    type: VerificationCodeType.EmailVerification,
    expiresAt: oneYearFromNow(),
  });

  const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

  const { data: emailData, error: emailError } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  appAssert(!emailError, INTERNAL_SERVER_ERROR, "Failed to send email");

  const session = await SessionModel.create({
    userId: userID,
    ...(data.userAgent && { userAgent: data.userAgent }),
  });

  const refreshToken = signToken(
    { sessionId: session._id },
    refreshTokenSignOptions,
  );

  const accessToken = signToken({
    userId: userID,
    sessionId: session._id,
  });

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
  const refreshToken = signToken(
    { sessionId: session._id },
    refreshTokenSignOptions,
  );

  //* Create Access Token
  const accessToken = signToken({
    userId: user._id,
    sessionId: session._id,
  });

  return {
    user: user.omitPassword(),
    accessToken,
    refreshToken,
  };
};

export const refreshUserAccessToken = async (refreshToken: string) => {
  const { payload, error } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);

  appAssert(
    session && session.expiresAt.getTime() > Date.now(),
    UNAUTHORIZED,
    "Session expired",
  );

  const sessionNeedsRefresh =
    session.expiresAt.getTime() - Date.now() <= ONE_DAY_IN_MS;

  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken({ sessionId: session._id }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return {
    accessToken,
    newRefreshToken: newRefreshToken,
  };
};

export const verifyUserEmail = async (verificationCode: string) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: Date.now() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    {
      verified: true,
    },
    {
      new: true,
    },
  );

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to Verify Email");

  await validCode.deleteOne();

  return {
    user: updatedUser.omitPassword(),
  };
};
