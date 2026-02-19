import { Request, Response } from "express";
import { OK, BAD_REQUEST } from "../../constants/http";
import catchErrors from "../../utils/catchErrors";
import {
  chatWithEcoMate,
  type ChatMessage,
} from "../../services/ai/chatbot.service";

export const chatHandler = catchErrors(async (req: Request, res: Response) => {
  const { messages, userMessage, imageBase64, imageMimeType } = req.body as {
    messages: ChatMessage[];
    userMessage: string;
    imageBase64?: string;
    imageMimeType?: string;
  };

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(BAD_REQUEST).json({ message: "userMessage is required" });
  }

  const history: ChatMessage[] = Array.isArray(messages)
    ? messages.slice(-20)
    : [];

  try {
    const reply = await chatWithEcoMate(
      history,
      userMessage.trim(),
      imageBase64,
      imageMimeType,
    );
    return res.status(OK).json({ reply });
  } catch (error: any) {
    console.error("[EcoMate] Error details:", {
      message: error?.message,
      status: error?.status,
      stack: error?.stack?.slice(0, 300),
    });
    return res.status(500).json({
      message: "EcoMate AI is temporarily unavailable",
      detail: error?.message || "Unknown error",
    });
  }
});
