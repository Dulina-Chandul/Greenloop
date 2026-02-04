import { Router } from "express";
import { getUserHandler } from "../../controllers/user/user.controller";
import authenticate from "../../middleware/Auth/authenticate";

const userRoutes = Router();

userRoutes.get("/", authenticate, getUserHandler);

export default userRoutes;
