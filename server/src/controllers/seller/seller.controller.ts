import { response } from "express";
import { sellerRegisterSchema } from "../../config/schemas/seller.schemas";
import { CONFLICT, CREATED, INTERNAL_SERVER_ERROR } from "../../constants/http";
import SellerModel from "../../models/seller/seller.model";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";
import { request } from "node:http";
import VerificationCodeModel from "../../models/verification/verification.model";
import VerificationCodeType from "../../constants/verificationCodeType";
import { oneYearFromNow } from "../../utils/date";
import { APP_ORIGIN } from "../../constants/env";
import { sendMail } from "../../utils/sendMail";
import { getVerifyEmailTemplate } from "../../utils/emailTemplates";
import SessionModel from "../../models/session/session.model";
import { refreshTokenSignOptions, signToken } from "../../utils/jwt";
import { setAuthCookies } from "../../utils/cookies";

const sellerController = {
  register: catchErrors(async (req, res) => {
    const request = sellerRegisterSchema.parse({
      ...req.body,
    });

    const userAgent = req.headers["user-agent"];

    const { confirmPassword, ...sellerData } = request;

    const cleanSellerData = Object.fromEntries(
      Object.entries(sellerData).filter(([_, value]) => value !== undefined),
    );

    //* Check the db whether user already axist
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

    const { data: emailData, error: emailError } = await sendMail({
      to: seller.email,
      ...getVerifyEmailTemplate(url),
    });

    appAssert(
      !emailError,
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email",
    );

    const session = await SessionModel.create({
      userId: sellerId,
      ...(userAgent ? { userAgent } : {}),
    });

    const refreshToken = signToken(
      { sessionId: session._id },
      refreshTokenSignOptions,
    );

    const accessToken = signToken({ userId: sellerId, sessionId: session._id });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        message: "Seller account created successfully",
        data: {
          user: seller.omitPassword(),
        },
      });
  }),
};

export default sellerController;
