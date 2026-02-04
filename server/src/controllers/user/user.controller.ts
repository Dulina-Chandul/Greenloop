import { NOT_FOUND, OK } from "../../constants/http";
import UserModel from "../../models/user/user.model";
import appAssert from "../../utils/appAssert";
import catchErrors from "../../utils/catchErrors";

export const getUserHandler = catchErrors(async (req, res) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found test from controller");
  return res.status(OK).json({ user: user.omitPassword() });
});
