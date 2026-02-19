import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../../constants/env";

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const SYSTEM_CONTEXT = `You are EcoMate, an intelligent eco-friendly AI assistant for GreenLoop — a waste recycling and upcycling marketplace in Sri Lanka.

Your role:
- Help sellers understand what materials they can recycle or upcycle
- Suggest creative upcycling projects with difficulty (Easy/Medium/Hard) and time estimates
- Provide tips on getting better prices for recyclable materials
- Educate users about recycling guidelines, material sorting, and sustainability
- Keep answers concise, friendly, and practical
- Relate advice back to the GreenLoop marketplace when relevant

Stay focused on eco, recycling, and sustainability topics.`;

export const chatWithEcoMate = async (
  history: ChatMessage[],
  userMessage: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<string> => {
  // Build conversation history turns (same shape as working gemini.service.ts)
  const contents: Array<{ role: string; parts: Array<any> }> = [];

  // Add system context as first user/model exchange so the model knows its role
  contents.push({
    role: "user",
    parts: [{ text: SYSTEM_CONTEXT }],
  });
  contents.push({
    role: "model",
    parts: [
      {
        text: "Understood! I am EcoMate, your eco-friendly AI assistant for GreenLoop. How can I help you today?",
      },
    ],
  });

  // Add conversation history
  for (const msg of history) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }],
    });
  }

  // Build current user message parts (mirroring gemini.service.ts exactly)
  const currentParts: Array<any> = [];

  // If image is attached, add it first (same inlineData shape as gemini.service.ts)
  if (imageBase64 && imageMimeType) {
    currentParts.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      },
    });
  }

  currentParts.push({ text: userMessage });

  contents.push({
    role: "user",
    parts: currentParts,
  });

  // Call Gemini — exact same call shape as the working gemini.service.ts
  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  const responseText = result?.text?.trim() || "";

  if (!responseText) {
    throw new Error("Empty response from Gemini");
  }

  return responseText;
};
