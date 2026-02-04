import jwt, { VerifyOptions, SignOptions } from "jsonwebtoken";
import { SessionDocument } from "../models/session/session.model";
import { UserDocument } from "../models/user/user.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";

export type UserRole = "user" | "seller" | "collector";

export type RefreshTokenPayload = {
  sessionId: string;
};

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  userRole: UserRole;
};

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

// const defaults: SignOptions = {
//   audience: ["user"],
// };

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  secret: JWT_SECRET,
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "30d",
  secret: JWT_REFRESH_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret,
) => {
  const { secret, ...signOpts } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    // ...defaults,
    ...signOpts,
  });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & {
    secret?: string;
  },
) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options || {};
  try {
    const payload = jwt.verify(token, secret, {
      // ...defaults,
      ...verifyOpts,
    }) as TPayload;
    console.log(
      "Payload in JWT Verify " + payload + " Remove this after development",
    );
    return { payload, error: null };
  } catch (error: any) {
    return {
      message: error.message,
      error: error.message,
    };
  }
};
