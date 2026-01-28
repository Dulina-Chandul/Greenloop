import { Response, CookieOptions } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";

const secure = process.env.NODE_ENV !== "development";

const defaults: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite: "strict",
};

const getAccessTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    expires: fifteenMinutesFromNow(),
  };
};

const getRefreshTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: "/auth/refresh",
  };
};

type Params = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

export const setAuthCookies = ({ res, accessToken, refreshToken }: Params) => {
  return res
    .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
    .cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());
};
