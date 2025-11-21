export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  emotion?: EmotionData;
}

export interface EmotionData {
  primary: EmotionType;
  confidence: number;
  all?: {
    [key in EmotionType]?: number;
  };
}

export type EmotionType = 
  | "joy" 
  | "sadness" 
  | "anger" 
  | "fear" 
  | "surprise" 
  | "neutral";

export interface ChatResponse {
  response: string;
  emotion: {
    primary: string;
    confidence: number;
    intensity: number;
    all_emotions: Record<string, number>;
  };
  response_type: string;
  tone: string;
  metadata: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId?: string;
  createdAt: Date;
  lastActivity: Date;
  messages: Message[];
}
