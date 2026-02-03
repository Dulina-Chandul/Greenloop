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

const sellerController = {
  // ============= REGISTER =============
  register: catchErrors(async (req, res) => {
    const request = sellerRegisterSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];

    const { confirmPassword, ...sellerData } = request;

    const cleanSellerData = Object.fromEntries(
      Object.entries(sellerData).filter(([_, value]) => value !== undefined),
    );

    // Check if seller already exists
    const sellerExist = await SellerModel.exists({
      $or: [
        { email: sellerData.email },
        { phoneNumber: sellerData.phoneNumber },
      ],
    });

    appAssert(!sellerExist, CONFLICT, "Email or Phone number already in use");

    // Create seller
    const seller = await SellerModel.create(cleanSellerData);
    const sellerId = seller._id;

    // Create verification code
    const verificationCode = await VerificationCodeModel.create({
      userId: sellerId,
      type: VerificationCodeType.EmailVerification,
      expiresAt: oneYearFromNow(),
    });

    const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

    // Send verification email
    const { data: emailData, error: emailError } = await sendMail({
      to: seller.email,
      ...getVerifyEmailTemplate(url),
    });

    appAssert(
      !emailError,
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email",
    );

    // Create session with role
    const session = await SessionModel.create({
      userId: sellerId,
      userRole: "seller", // ← UPDATED: Add role
      ...(userAgent ? { userAgent } : {}),
    });

    // Create tokens with role
    const refreshToken = signToken(
      { sessionId: session._id },
      refreshTokenSignOptions,
    );

    const accessToken = signToken({
      userId: sellerId.toString(),
      sessionId: session._id.toString(),
      userRole: "seller", // ← UPDATED: Add role
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        message: "Seller account created successfully",
        data: {
          user: seller.omitPassword(),
          role: "seller", // ← UPDATED: Return role
        },
      });
  }),

  // ============= LOGIN =============
  login: catchErrors(async (req, res) => {
    const request = sellerLoginSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];

    // Find seller by email or phone number
    const query: any = {};
    if (request.email) query.email = request.email;
    if (request.phoneNumber) query.phoneNumber = request.phoneNumber;

    const seller = await SellerModel.findOne(query);

    appAssert(seller, UNAUTHORIZED, "Invalid credentials");

    // Verify password
    const isPasswordValid = await seller.comparePassword(request.password);

    appAssert(isPasswordValid, UNAUTHORIZED, "Invalid credentials");

    // Create session with role
    const session = await SessionModel.create({
      userId: seller._id,
      userRole: "seller",
      ...(userAgent ? { userAgent } : {}),
    });

    // Create tokens with role
    const refreshToken = signToken(
      { sessionId: session._id },
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
