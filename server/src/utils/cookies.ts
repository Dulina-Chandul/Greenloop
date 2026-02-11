import { Response, CookieOptions } from "express";
import { fifteenMinutesFromNow, thirtyDaysFromNow } from "./date";
import { NODE_ENV } from "../constants/env";

const secure = NODE_ENV !== "development";

export const REFRESH_PATH = "/api/v1/auth/refresh";

const defaults: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite: NODE_ENV === "production" ? "none" : "lax",
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    path: "/",
    expires: fifteenMinutesFromNow(),
  };
};

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    expires: thirtyDaysFromNow(),
    path: REFRESH_PATH,
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

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken", { path:"/" });
