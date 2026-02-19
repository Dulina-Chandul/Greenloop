import { Router } from "express";
import authenticate from "../../middleware/Auth/authenticate";
import { chatHandler } from "../../controllers/ai/chatbot.controller";

const aiRouter = Router();

// POST /api/v1/ai/chat
aiRouter.post("/chat", authenticate, chatHandler);

export default aiRouter;
