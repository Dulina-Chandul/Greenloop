import { RequestHandler } from "express";
import appAssert from "../../utils/appAssert";
import { UNAUTHORIZED, FORBIDDEN } from "../../constants/http";
import AppErrorCode from "../../constants/appErrorCode";
import { verifyToken, UserRole } from "../../utils/jwt";
import UserModel from "../../models/user/user.model";
import SellerModel from "../../models/seller/seller.model";
import CollectorModel from "../../models/collector/collecter.model";

//* Authenticate the user using access token
export const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Unauthorized",
    AppErrorCode.InvalidAccessToken,
  );

  const { error, payload } = verifyToken(accessToken);

  appAssert(
    payload,
    UNAUTHORIZED,
    error === "jwt expired" ? "Token Expired" : "Invalid Token",
    AppErrorCode.InvalidAccessToken,
  );

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  req.userRole = payload.userRole;

  next();
};

//* Authorize the user based on role

export const authorize = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    appAssert(
      req.userRole,
      UNAUTHORIZED,
      "Authentication required",
      AppErrorCode.InvalidAccessToken,
    );

    const hasPermission = allowedRoles.includes(req.userRole);

    appAssert(
      hasPermission,
      FORBIDDEN,
      `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      AppErrorCode.InsufficientPermissions,
    );

    next();
  };
};

//* Check if the user is verified
export const requireVerified: RequestHandler = async (req, res, next) => {
  try {
    appAssert(req.userId, UNAUTHORIZED, "Authentication required");
    appAssert(req.userRole, UNAUTHORIZED, "User role not found");

    let Model;
    switch (req.userRole) {
      case "seller":
        Model = SellerModel;
        break;
      case "collector":
        Model = CollectorModel;
        break;
      case "user":
      default:
        Model = UserModel;
        break;
    }

    const user = await (Model as any).findById(req.userId);

    appAssert(user, UNAUTHORIZED, "User not found");
    appAssert(
      user.verified,
      FORBIDDEN,
      "Please verify your email first",
      AppErrorCode.EmailNotVerified,
    );

    next();
  } catch (error) {
    next(error);
  }
};

//* Check if the role is seller
export const isSeller: RequestHandler = authorize("seller");

//* Check if the user is collector
export const isCollector: RequestHandler = authorize("collector");

//* Check if the user role is seller or collector
export const isSellerOrCollector: RequestHandler = authorize(
  "seller",
  "collector",
);

export default authenticate;
