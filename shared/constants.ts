// Shared constants for EdgeSoul v2

// Emotion Types
export const EMOTION_TYPES = [
  "joy",
  "sadness",
  "anger",
  "fear",
  "surprise",
  "neutral",
] as const;

export type EmotionType = typeof EMOTION_TYPES[number];

// Emotion Display Labels
export const EMOTION_LABELS: Record<EmotionType, string> = {
  joy: "Joy 😊",
  sadness: "Sadness 😢",
  anger: "Anger 😠",
  fear: "Fear 😨",
  surprise: "Surprise 😲",
  neutral: "Neutral 😐",
};

// Emotion Colors
export const EMOTION_COLORS: Record<EmotionType, string> = {
  joy: "#10b981",      // green-500
  sadness: "#3b82f6",  // blue-500
  anger: "#ef4444",    // red-500
  fear: "#8b5cf6",     // purple-500
  surprise: "#f59e0b", // yellow-500
  neutral: "#6b7280",  // gray-500
};

// Message Roles
export const MESSAGE_ROLES = ["user", "assistant", "system"] as const;
export type MessageRole = typeof MESSAGE_ROLES[number];

// Session Status
export const SESSION_STATUS = ["active", "archived", "deleted"] as const;
export type SessionStatus = typeof SESSION_STATUS[number];

// API Endpoints
export const API_ENDPOINTS = {
  chat: "/api/v1/chat",
  emotion: "/api/v1/emotion/detect",
  knowledge: "/api/v1/knowledge/query",
  health: "/health",
} as const;

// Constraints
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_SESSION_MESSAGES = 100;
export const MAX_CONTEXT_LENGTH = 2000;

// Model Configuration
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_TOKENS = 500;

// Rate Limiting
export const RATE_LIMIT_REQUESTS = 60;
export const RATE_LIMIT_WINDOW = 60; // seconds
