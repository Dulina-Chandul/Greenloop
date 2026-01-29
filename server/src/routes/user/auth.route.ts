import express from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  verifyEmailHandler,
} from "../../controllers/user/auth.controller";

const authRouter = express.Router();

//* Register a new User
authRouter.post("/register", registerHandler);

//* Login a user
authRouter.post("/login", loginHandler);

//* Logout a user
authRouter.get("/logout", logoutHandler);

//* Refresh Handler
authRouter.get("/refresh", refreshHandler);

//* Verify Email Handler
authRouter.get("/email/verify/:code", verifyEmailHandler);

export default authRouter;
