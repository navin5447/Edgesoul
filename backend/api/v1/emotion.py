from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from loguru import logger

from services.emotion_service import emotion_service
from models.emotion import EmotionRequest, EmotionResponse

router = APIRouter()


@router.post("/emotion/detect", response_model=EmotionResponse)
async def detect_emotion(request: EmotionRequest):
    """
    Detect emotion in text.
    """
    try:
        logger.info(f"Detecting emotion for text: {request.text[:50]}...")
        
        emotion_data = await emotion_service.detect_emotion(request.text)
        
        return EmotionResponse(
            primary_emotion=emotion_data["primary"],
            confidence=emotion_data["confidence"],
            all_emotions=emotion_data["all"],
        )
    
    except Exception as e:
        logger.error(f"Error in emotion detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/emotion/analyze/{text}")
async def analyze_emotion(text: str):
    """
    Quick emotion analysis endpoint.
    """
    try:
        emotion_data = await emotion_service.detect_emotion(text)
        return emotion_data
    except Exception as e:
        logger.error(f"Error analyzing emotion: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
