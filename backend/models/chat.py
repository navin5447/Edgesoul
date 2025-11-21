from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    context: Optional[str] = None


class EmotionData(BaseModel):
    """Emotion detection data."""
    primary: str
    confidence: float
    all: Optional[Dict[str, float]] = None


class ChatResponse(BaseModel):
    """Chat response model for EdgeSoul v3.0."""
    message: str
    emotion: str  # Primary emotion
    confidence: float
    all_emotions: Dict[str, float]
    context: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Message(BaseModel):
    """Message model."""
    id: str
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: datetime
    emotion: Optional[EmotionData] = None
