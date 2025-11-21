from pydantic import BaseModel, Field
from typing import Dict, Optional


class EmotionRequest(BaseModel):
    """Request model for emotion detection."""
    text: str = Field(..., min_length=1, max_length=4000)


class EmotionResponse(BaseModel):
    """Response model for emotion detection."""
    primary_emotion: str
    confidence: float
    all_emotions: Optional[Dict[str, float]] = None
    

class EmotionType:
    """Emotion types."""
    JOY = "joy"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    SURPRISE = "surprise"
    NEUTRAL = "neutral"
