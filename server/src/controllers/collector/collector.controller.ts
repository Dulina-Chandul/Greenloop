import { CREATED, CONFLICT, INTERNAL_SERVER_ERROR } from "../../constants/http";
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

const collectorController = {
  register: catchErrors(async (req, res) => {
    const request = collectorRegisterSchema.parse({
      ...req.body,
    });

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

    const { data: emailData, error: emailError } = await sendMail({
      to: collector.email,
      ...getVerifyEmailTemplate(url),
    });

    appAssert(
      !emailError,
      INTERNAL_SERVER_ERROR,
      "Failed to send verification email",
    );

    const session = await SessionModel.create({
      userId: collectorId,
      ...(userAgent ? { userAgent } : {}),
    });

    const refreshToken = signToken(
      { sessionId: session._id },
      refreshTokenSignOptions,
    );

    const accessToken = signToken({
      userId: collectorId,
      sessionId: session._id,
    });

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(CREATED)
      .json({
        message: "Collector account created successfully",
        data: {
          user: collector.omitPassword(),
        },
      });
  }),
};

export default collectorController;
