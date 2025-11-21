import { create } from "zustand";
import { Message, EmotionData } from "../types/chat";

interface ChatState {
  messages: Message[];
  currentEmotion: EmotionData | null;
  sessionId: string | null;
  addMessage: (message: Message) => void;
  setCurrentEmotion: (emotion: EmotionData | null) => void;
  setSessionId: (id: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentEmotion: null,
  sessionId: null,
  
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      currentEmotion: message.emotion || state.currentEmotion,
    })),
  
  setCurrentEmotion: (emotion) =>
    set({ currentEmotion: emotion }),
  
  setSessionId: (id) =>
    set({ sessionId: id }),
  
  clearMessages: () =>
    set({ messages: [], currentEmotion: null }),
}));
