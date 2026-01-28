import express from "express";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
} from "../../controllers/user/auth.controller";

const authRouter = express.Router();

authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/logout", logoutHandler);

export default authRouter;
