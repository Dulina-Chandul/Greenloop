import { Router } from "express";
import {
  deleteSessionHandler,
  getSessionsHandler,
} from "../../controllers/user/session.controller";

const sessionRoutes = Router();

//* Get all sessions
sessionRoutes.get("/", getSessionsHandler);

//* Delete a session
sessionRoutes.delete("/:id", deleteSessionHandler);

export default sessionRoutes;
