import { Router } from "express";
import {
  getUserHandler,
  updateUserHandler,
} from "../../controllers/user/user.controller";
import authenticate from "../../middleware/Auth/authenticate";

const userRoutes = Router();

userRoutes.get("/", authenticate, getUserHandler);
userRoutes.put("/", authenticate, updateUserHandler);

export default userRoutes;
