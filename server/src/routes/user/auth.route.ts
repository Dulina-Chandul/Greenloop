import express from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
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

export default authRouter;
