"""Shared constants for EdgeSoul v2."""

# Emotion Types
EMOTION_TYPES = ["joy", "sadness", "anger", "fear", "surprise", "neutral"]

# Emotion Display Labels
EMOTION_LABELS = {
    "joy": "Joy 😊",
    "sadness": "Sadness 😢",
    "anger": "Anger 😠",
    "fear": "Fear 😨",
    "surprise": "Surprise 😲",
    "neutral": "Neutral 😐",
}

# Emotion Colors (Tailwind classes)
EMOTION_COLORS = {
    "joy": "#10b981",      # green-500
    "sadness": "#3b82f6",  # blue-500
    "anger": "#ef4444",    # red-500
    "fear": "#8b5cf6",     # purple-500
    "surprise": "#f59e0b", # yellow-500
    "neutral": "#6b7280",  # gray-500
}

# Message Roles
MESSAGE_ROLES = ["user", "assistant", "system"]

# Session Status
SESSION_STATUS = ["active", "archived", "deleted"]

# API Endpoints
API_ENDPOINTS = {
    "chat": "/api/v1/chat",
    "emotion": "/api/v1/emotion/detect",
    "knowledge": "/api/v1/knowledge/query",
    "health": "/health",
}

# Constraints
MAX_MESSAGE_LENGTH = 4000
MAX_SESSION_MESSAGES = 100
MAX_CONTEXT_LENGTH = 2000

# Model Configuration
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 500

# Rate Limiting
RATE_LIMIT_REQUESTS = 60
RATE_LIMIT_WINDOW = 60  # seconds
