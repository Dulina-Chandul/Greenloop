import { NOT_FOUND, OK } from "../../constants/http";
import CollectorModel from "../../models/collector/collecter.model";
import SellerModel from "../../models/seller/seller.model";
import UserModel from "../../models/user/user.model";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";

export const getUserHandler = catchErrors(async (req, res) => {
  if (req.userRole === "seller") {
    const user = await SellerModel.findById(req.userId);
    appAssert(user, NOT_FOUND, "User not found test from controller");
    return res.status(OK).json({ user: user.omitPassword() });
  } else if (req.userRole === "collector") {
    const user = await CollectorModel.findById(req.userId);
    appAssert(user, NOT_FOUND, "User not found test from controller");
    return res.status(OK).json({ user: user.omitPassword() });
  } else if (req.userRole === "user") {
    const user = await UserModel.findById(req.userId);
    appAssert(user, NOT_FOUND, "User not found test from controller");
    return res.status(OK).json({ user: user.omitPassword() });
  }
});
