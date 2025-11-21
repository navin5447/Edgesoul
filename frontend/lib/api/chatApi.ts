import axios from "axios";
import { ChatResponse } from "../types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const chatApi = {
  sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>("/chat", {
      message,
      user_id: sessionId,
    });
    return response.data;
  },

  detectEmotion: async (text: string) => {
    const response = await apiClient.post("/analyze", {
      text,
    });
    return response.data;
  },

  getKnowledgeResponse: async (query: string, context?: string) => {
    const response = await apiClient.post("/chat", {
      message: query,
      context,
    });
    return response.data;
  },
};
