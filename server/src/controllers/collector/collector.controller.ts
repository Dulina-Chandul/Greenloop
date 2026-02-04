import {
  CREATED,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  OK,
  UNAUTHORIZED,
} from "../../constants/http";
import { setAuthCookies } from "../../utils/cookies";
import { APP_ORIGIN } from "../../constants/env";
import { getVerifyEmailTemplate } from "../../utils/emailTemplates";
import { oneYearFromNow } from "../../utils/date";
import { sendMail } from "../../utils/sendMail";
import SessionModel from "../../models/session/session.model";
import VerificationCodeModel from "../../models/verification/verification.model";
import VerificationCodeType from "../../constants/verificationCodeType";
import { refreshTokenSignOptions, signToken } from "../../utils/jwt";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";
import { collectorRegisterSchema } from "../../config/schemas/collector.schemas";
import CollectorModel from "../../models/collector/collecter.model";
import { sellerLoginSchema } from "../../config/schemas/seller.schemas";

const collectorController = {
  //* Collector register
  register: catchErrors(async (req, res) => {
    const request = collectorRegisterSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];

    const { confirmPassword, ...collectorData } = request;

    const cleanCollectorData = Object.fromEntries(
      Object.entries(collectorData).filter(([_, value]) => value !== undefined),
    );

    const existingCollector = await CollectorModel.exists({
      $or: [
        { email: collectorData.email },
        { phoneNumber: collectorData.phoneNumber },
      ],
    });

    appAssert(
      !existingCollector,
      CONFLICT,
      "Email or Phone number already in use",
    );

    const collector = await CollectorModel.create(cleanCollectorData);
    const collectorId = collector._id;

    const verificationCode = await VerificationCodeModel.create({
      userId: collectorId,
      type: VerificationCodeType.EmailVerification,
      expiresAt: oneYearFromNow(),
    });

    const url = `${APP_ORIGIN}/email/verify/${verificationCode._id}`;

    //TODO : change this service to like nodemailer
    const { data: emailData, error: emailError } = await sendMail({
      to: collector.email,
      ...getVerifyEmailTemplate(url),
    });

    appAssert(
      !emailError,
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email",
    );

    //* Create session for the collector
    const session = await SessionModel.create({
      userId: collectorId,
      userRole: "collector", // ← UPDATED: Add role
      ...(userAgent ? { userAgent } : {}),
    });

    //* Create refresh tokens for the collector
    const refreshToken = signToken(
      { sessionId: session._id.toString() },
      refreshTokenSignOptions,
    );

    //* Create access token for the collector
    const accessToken = signToken({
      userId: collectorId.toString(),
      sessionId: session._id.toString(),
      userRole: "collector",
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        message: "Collector account created successfully",
        data: {
          user: collector.omitPassword(),
          role: "collector",
        },
      });
  }),

  //* Collector login
  //! Change this to collector login schema
  login: catchErrors(async (req, res) => {
    const request = sellerLoginSchema.parse(req.body);
    const userAgent = req.headers["user-agent"];

    const query: any = {};
    if (request.email) query.email = request.email;
    if (request.phoneNumber) query.phoneNumber = request.phoneNumber;

    const collector = await CollectorModel.findOne(query);

    appAssert(collector, UNAUTHORIZED, "Invalid credentials");

    const isPasswordValid = await collector.comparePassword(request.password);

    appAssert(isPasswordValid, UNAUTHORIZED, "Invalid credentials");

    const session = await SessionModel.create({
      userId: collector._id,
      userRole: "collector",
      ...(userAgent ? { userAgent } : {}),
    });

    const refreshToken = signToken(
      { sessionId: session._id.toString() },
      refreshTokenSignOptions,
    );

    const accessToken = signToken({
      userId: collector._id.toString(),
      sessionId: session._id.toString(),
      userRole: "collector",
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(OK)
      .json({
        message: "Collector logged in successfully",
        data: {
          user: collector.omitPassword(),
          role: "collector",
        },
      });
  }),
};

export default collectorController;
