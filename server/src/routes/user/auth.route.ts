import express from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  resetPasswordHandler,
  sendPasswordResetHandler,
  verifyEmailHandler,
} from "../../controllers/user/auth.controller";

const authRouter = express.Router();

//* Login a user
authRouter.post("/login", loginHandler);

//* Logout a user
authRouter.get("/logout", logoutHandler);

//* Refresh Handler
authRouter.get("/refresh", refreshHandler);

//* Verify Email Handler
authRouter.get("/email/verify/:code", verifyEmailHandler);

//* Forgot Password Handler
authRouter.post("/password/forgot", sendPasswordResetHandler);

//* Reset Password Handler
authRouter.post("/password/reset", resetPasswordHandler);

export default authRouter;
