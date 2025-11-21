from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from core.config import settings
from api.v1 import chat, emotion, knowledge, memory
from services.intelligent_reply_engine import intelligent_reply_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup
    logger.info("Starting EdgeSoul v3.0 API...")
    logger.info("Intelligent Reply Engine loaded successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down EdgeSoul v3.0 API...")


app = FastAPI(
    title="EdgeSoul v3.0 API",
    description="Next-Generation AI Companion with Advanced Emotion Intelligence",
    version="3.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(emotion.router, prefix="/api/v1", tags=["emotion"])
app.include_router(knowledge.router, prefix="/api/v1", tags=["knowledge"])
app.include_router(memory.router, prefix="/api/v1/memory", tags=["memory"])

# Add v2-compatible endpoint for frontend compatibility
from pydantic import BaseModel
from typing import Optional

class V2ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    context: Optional[str] = None

@app.post("/chat")
async def v2_chat_endpoint(request: V2ChatRequest):
    """V2-compatible chat endpoint for frontend"""
    try:
        # Use intelligent reply engine
        response = await intelligent_reply_engine.generate_reply(
            message=request.message,
            user_id=request.user_id or "default",
            context=request.context,
        )
        
        # Transform to v2 format
        return {
            "response": response['message'],
            "emotion": {
                "primary": response['emotion']['primary'],
                "confidence": response['emotion']['confidence'],
                "intensity": response['emotion']['intensity'],
                "all_emotions": response['emotion']['all_emotions']
            },
            "response_type": response['strategy'],
            "tone": response['emotion']['primary'],
            "metadata": response['metadata']
        }
    except Exception as e:
        logger.error(f"Error in v2 chat endpoint: {e}")
        return {
            "response": "I'm having some trouble processing that. Could you try again?",
            "emotion": {"primary": "neutral", "confidence": 0.5, "intensity": 50, "all_emotions": {}},
            "response_type": "error",
            "tone": "neutral",
            "metadata": {"error": str(e)}
        }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "EdgeSoul v3.0 API",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "Advanced Emotion Detection",
            "Context-Aware Response Routing", 
            "Intelligent Reply Engine",
            "Emotional Support & Knowledge",
            "Personality Adaptation"
        ],
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "3.0.0",
        "engine": "intelligent_reply_engine",
        "capabilities": [
            "emotion_classification",
            "context_detection", 
            "response_routing",
            "personality_traits"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
