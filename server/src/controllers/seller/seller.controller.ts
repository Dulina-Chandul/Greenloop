import {
  sellerLoginSchema,
  sellerRegisterSchema,
} from "../../config/schemas/seller.schemas";
import {
  CONFLICT,
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
  UNAUTHORIZED,
} from "../../constants/http";
import SellerModel from "../../models/seller/seller.model";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";
import VerificationCodeModel from "../../models/verification/verification.model";
import VerificationCodeType from "../../constants/verificationCodeType";
import { oneYearFromNow } from "../../utils/date";
import { APP_ORIGIN } from "../../constants/env";
import { sendMail } from "../../utils/sendMail";
import { getVerifyEmailTemplate } from "../../utils/emailTemplates";
import SessionModel from "../../models/session/session.model";
import { refreshTokenSignOptions, signToken } from "../../utils/jwt";
import { setAuthCookies } from "../../utils/cookies";
import { Request, Response } from "express";

const sellerController = {
  //* Seller register
  register: catchErrors(async (req: Request, res: Response) => {
    const request = sellerRegisterSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];

    const { confirmPassword, ...sellerData } = request;

    const cleanSellerData = Object.fromEntries(
      Object.entries(sellerData).filter(([_, value]) => value !== undefined),
    );

    const sellerExist = await SellerModel.exists({
      $or: [
        { email: sellerData.email },
        { phoneNumber: sellerData.phoneNumber },
      ],
    });

    appAssert(!sellerExist, CONFLICT, "Email or Phone number already in use");

    const seller = await SellerModel.create(cleanSellerData);
    const sellerId = seller._id;

    const verificationCode = await VerificationCodeModel.create({
      userId: sellerId,
      type: VerificationCodeType.EmailVerification,
      expiresAt: oneYearFromNow(),
    });

    const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

    //TODO : change this service to like nodemailer
    const { data: emailData, error: emailError } = await sendMail({
      to: seller.email,
      ...getVerifyEmailTemplate(url),
    });

    appAssert(
      !emailError,
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email",
    );

    //* Create session for the seller
    const session = await SessionModel.create({
      userId: sellerId,
      userRole: "seller",
      ...(userAgent ? { userAgent } : {}),
    });

    //* Create refresh tokens for the seller
    const refreshToken = signToken(
      { sessionId: session._id.toString() },
      refreshTokenSignOptions,
    );

    //* Create access token for the seller
    const accessToken = signToken({
      userId: sellerId.toString(),
      sessionId: session._id.toString(),
      userRole: "seller",
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        message: "Seller account created successfully",
        data: {
          user: seller.omitPassword(),
          role: "seller",
        },
      });
  }),

  //* Seller login
  login: catchErrors(async (req: Request, res: Response) => {
    const request = sellerLoginSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];

    const query: any = {};
    if (request.email) query.email = request.email;
    if (request.phoneNumber) query.phoneNumber = request.phoneNumber;

    const seller = await SellerModel.findOne(query);

    appAssert(seller, UNAUTHORIZED, "Invalid credentials");

    const isPasswordValid = await seller.comparePassword(request.password);

    appAssert(isPasswordValid, UNAUTHORIZED, "Invalid credentials");

    const session = await SessionModel.create({
      userId: seller._id,
      userRole: "seller",
      ...(userAgent ? { userAgent } : {}),
    });

    const refreshToken = signToken(
      { sessionId: session._id.toString() },
      refreshTokenSignOptions,
    );

    const accessToken = signToken({
      userId: seller._id.toString(),
      sessionId: session._id.toString(),
      userRole: "seller",
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Seller logged in successfully",
        data: {
          user: seller.omitPassword(),
          role: "seller",
        },
      });
  }),
};

export default sellerController;
