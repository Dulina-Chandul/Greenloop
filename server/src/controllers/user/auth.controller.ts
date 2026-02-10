import catchErrors from "../../utils/catchErrors";
import {
  CREATED,
  OK,
  UNAUTHORIZED,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  INTERNAL_SERVER_ERROR,
} from "../../constants/http";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../../utils/cookies";
import {
  verifyToken,
  signToken,
  refreshTokenSignOptions,
  RefreshTokenPayload,
  UserRole,
} from "../../utils/jwt";
import SessionModel from "../../models/session/session.model";
import UserModel from "../../models/user/user.model";
import SellerModel from "../../models/seller/seller.model";
import CollectorModel from "../../models/collector/collector.model";
import VerificationCodeModel from "../../models/verification/verification.model";
import VerificationCodeType from "../../constants/verificationCodeType";
import appAssert from "../../utils/appAssert";
import z from "zod";
import {
  ONE_DAY_IN_MS,
  thirtyDaysFromNow,
  fiveMinutesAgo,
  oneHourFromNow,
} from "../../utils/date";
import { sendMail } from "../../utils/sendMail";
import { getPasswordResetTemplate } from "../../utils/emailTemplates";
import { hashValue } from "../../utils/bcrypt";
import { APP_ORIGIN } from "../../constants/env";
import {
  emailSchema,
  resetPasswordSchema,
  unifiedLoginSchema,
  verificationCodeSchema,
} from "../../config/schemas/auth.schemas";

//* Login Handler
export const loginHandler = catchErrors(async (req, res) => {
  const request = unifiedLoginSchema.parse(req.body);
  const userAgent = req.headers["user-agent"];

  const query: any = {};
  if (request.email) query.email = request.email;
  if (request.phoneNumber) query.phoneNumber = request.phoneNumber;

  let user = null;
  let role: UserRole = "user";

  user = await SellerModel.findOne(query);
  if (user) {
    role = "seller";
  } else {
    user = await CollectorModel.findOne(query);
    if (user) {
      role = "collector";
    } else {
      user = await UserModel.findOne(query);
      if (user) {
        role = "user";
      }
    }
  }

  appAssert(user, UNAUTHORIZED, "Invalid credentials, user not found");

  //* Verify user password
  const isPasswordValid = await user.comparePassword(request.password);
  appAssert(isPasswordValid, UNAUTHORIZED, "Invalid credentials");

  //* Create session for the logged in user
  const session = await SessionModel.create({
    userId: user._id,
    userRole: role,
    ...(userAgent && { userAgent }),
  });

  //* Create refresh tokens
  const refreshToken = signToken(
    { sessionId: session._id.toString() },
    refreshTokenSignOptions,
  );

  //* Create access tokens
  const accessToken = signToken({
    userId: user._id.toString(),
    sessionId: session._id.toString(),
    userRole: role,
  });

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({
      message: "Login successful",
      data: {
        user: user.omitPassword(),
        role,
      },
    });
});

//* Logout Handler
export const logoutHandler = catchErrors(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  const { payload, error } = verifyToken(accessToken || "");

  if (payload) {
    await SessionModel.findByIdAndDelete(payload.sessionId);
  }

  return clearAuthCookies(res).status(OK).json({
    message: "Logged out successfully",
  });
});

//* Refresh Token Handler
export const refreshHandler = catchErrors(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  console.log("Refresh Handler Called");
  console.log("RefreshToken Cookie:", refreshToken ? "Present" : "Missing");

  appAssert(refreshToken, UNAUTHORIZED, "Invalid refresh token");

  const { payload, error } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });

  if (error) {
    console.log("Token verification failed:", error);
  }

  appAssert(payload, UNAUTHORIZED, "Invalid refresh token");

  const session = await SessionModel.findById(payload.sessionId);

  if (!session) {
    console.log("Session not found for ID:", payload.sessionId);
  } else if (session.expiresAt.getTime() <= Date.now()) {
    console.log("Session expired. ExpiresAt:", session.expiresAt);
  }

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
    ? signToken({ sessionId: session._id.toString() }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({
    userId: session.userId.toString(),
    sessionId: session._id.toString(),
    userRole: session.userRole,
  });

  if (newRefreshToken) {
    res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .json({
      message: "Access token refreshed successfully",
    });
});

//* Verify Email Handler
export const verifyEmailHandler = catchErrors(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: Date.now() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  const session = await SessionModel.findOne({ userId: validCode.userId }).sort(
    { createdAt: -1 },
  );

  let updatedUser = null;

  if (session) {
    const Model =
      session.userRole === "seller"
        ? SellerModel
        : session.userRole === "collector"
          ? CollectorModel
          : UserModel;

    updatedUser = await (Model as any).findByIdAndUpdate(
      validCode.userId,
      { verified: true },
      { new: true },
    );
  } else {
    updatedUser = await SellerModel.findByIdAndUpdate(
      validCode.userId,
      { verified: true },
      { new: true },
    );

    if (!updatedUser) {
      updatedUser = await CollectorModel.findByIdAndUpdate(
        validCode.userId,
        { verified: true },
        { new: true },
      );
    }

    //! Remove if delete the user model later
    if (!updatedUser) {
      updatedUser = await UserModel.findByIdAndUpdate(
        validCode.userId,
        { verified: true },
        { new: true },
      );
    }
  }

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to verify email");

  await validCode.deleteOne();

  return res.status(OK).json({
    message: "Email verified successfully",
  });
});

//* Send Password Reset Handler
export const sendPasswordResetHandler = catchErrors(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  let user = await SellerModel.findOne({ email });
  if (!user) user = await CollectorModel.findOne({ email });

  //! Remove if user model deleted in future
  if (!user) user = await UserModel.findOne({ email });

  appAssert(user, NOT_FOUND, "User not found");

  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationCodeModel.countDocuments({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });

  //* For now only allow to send 2 password reset mails
  appAssert(
    count <= 1,
    TOO_MANY_REQUESTS,
    "Too many requests, please try again later",
  );

  const expiresAt = oneHourFromNow();
  const verificationCode = await VerificationCodeModel.create({
    userId: user._id,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  const url = `${APP_ORIGIN}/password/reset/?code=${verificationCode._id}&exp=${expiresAt.getTime()}`;

  //TODO : change this service to like nodemailer
  const { data: emailData, error: emailError } = await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });

  appAssert(
    emailData?.id,
    INTERNAL_SERVER_ERROR,
    `Failed to send password reset email to ${user.email}`,
  );

  return res.status(OK).json({
    message: "Password reset email sent successfully",
    data: {
      url,
      emailId: emailData.id,
    },
  });
});

//* Reset Password Handler
export const resetPasswordHandler = catchErrors(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  const validCode = await VerificationCodeModel.findOne({
    _id: request.verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });

  appAssert(validCode, NOT_FOUND, "Invalid or expired verification code");

  let updatedUser = await SellerModel.findByIdAndUpdate(validCode.userId, {
    password: await hashValue(request.password),
  });

  if (!updatedUser) {
    updatedUser = await CollectorModel.findByIdAndUpdate(validCode.userId, {
      password: await hashValue(request.password),
    });
  }

  if (!updatedUser) {
    updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
      password: await hashValue(request.password),
    });
  }

  appAssert(updatedUser, INTERNAL_SERVER_ERROR, "Failed to reset password");

  await validCode.deleteOne();

  await SessionModel.deleteMany({ userId: updatedUser._id });

  return clearAuthCookies(res)
    .status(OK)
    .json({
      message: "Password reset successfully",
      data: {
        user: updatedUser.omitPassword(),
      },
    });
});
