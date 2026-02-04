import { Router } from "express";
import {
  deleteSessionHandler,
  getSessionsHandler,
} from "../../controllers/user/session.controller";
import authenticate from "../../middleware/Auth/authenticate";

const sessionRoutes = Router();

//* Get all sessions
sessionRoutes.get("/", authenticate, getSessionsHandler);

//* Delete a session
sessionRoutes.delete("/:id", authenticate, deleteSessionHandler);

export default sessionRoutes;
