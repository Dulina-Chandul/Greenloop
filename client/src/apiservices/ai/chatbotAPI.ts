import axiosInstance from "@/config/api/axiosInstance";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChatResponse {
  reply: string;
}

export const sendChatMessageAPI = async (
  messages: ChatMessage[],
  userMessage: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<ChatResponse> => {
  const response = await axiosInstance.post<any, ChatResponse>("/ai/chat", {
    messages,
    userMessage,
    ...(imageBase64 && imageMimeType ? { imageBase64, imageMimeType } : {}),
  });
  return response;
};
