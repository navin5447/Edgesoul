"""
FastAPI Application - EdgeSoul Chatbot API
Optimized for fast JSON responses with emotion detection + knowledge reasoning
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from loguru import logger
import time

# Import services
from services.emotion_service import emotion_service
from services.hybrid_chat_engine import hybrid_chat_engine


# ============================================================================
# Pydantic Models for Request/Response
# ============================================================================

class AnalyzeRequest(BaseModel):
    """Request model for emotion analysis"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I'm so happy today!"
            }
        }


class AnalyzeResponse(BaseModel):
    """Response model for emotion analysis"""
    emotion: str = Field(..., description="Primary detected emotion")
    confidence: float = Field(..., description="Confidence score (0-100)")
    all_emotions: Dict[str, float] = Field(..., description="All emotion scores")
    processing_time: float = Field(..., description="Processing time in seconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "emotion": "joy",
                "confidence": 95.5,
                "all_emotions": {
                    "joy": 95.5,
                    "love": 2.3,
                    "surprise": 1.1,
                    "sadness": 0.5,
                    "anger": 0.4,
                    "fear": 0.2
                },
                "processing_time": 0.15
            }
        }


class ChatRequest(BaseModel):
    """Request model for chat"""
    message: str = Field(..., min_length=1, max_length=5000, description="User message")
    context: Optional[str] = Field(None, description="Optional conversation context")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What is backward chaining?",
                "context": "User was asking about AI concepts"
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat"""
    response: str = Field(..., description="Bot response text")
    emotion: Dict[str, Any] = Field(..., description="Detected emotion data")
    response_type: str = Field(..., description="Type of response (hybrid_knowledge, emotional_support)")
    tone: Optional[str] = Field(None, description="Emotional tone applied")
    metadata: Dict[str, Any] = Field(..., description="Additional metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "Backward chaining is a reasoning strategy in AI...",
                "emotion": {
                    "primary": "joy",
                    "confidence": 85.5,
                    "all": {
                        "joy": 85.5,
                        "love": 8.2,
                        "surprise": 3.1,
                        "sadness": 1.5,
                        "anger": 1.0,
                        "fear": 0.7
                    }
                },
                "response_type": "hybrid_knowledge",
                "tone": "joyful",
                "metadata": {
                    "processing_time": 0.45,
                    "model": "tinyllama",
                    "knowledge_used": True,
                    "timestamp": "2025-11-13T09:15:30"
                }
            }
        }


# ============================================================================
# FastAPI App Configuration
# ============================================================================

app = FastAPI(
    title="EdgeSoul Chatbot API",
    description="Fast emotion detection + knowledge reasoning with local AI",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration - Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Startup/Shutdown Events
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    logger.info("🚀 Starting EdgeSoul API...")
    
    try:
        # Load emotion detection model
        await emotion_service.load_model()
        logger.info("✅ Emotion detection model loaded")
        
        # Initialize knowledge engine (Ollama)
        from services.knowledge_engine import knowledge_engine
        await knowledge_engine.initialize()
        
        if knowledge_engine.is_available:
            logger.info(f"✅ Ollama knowledge engine ready (model: {knowledge_engine.model_name})")
        else:
            logger.warning("⚠️  Ollama not available - using fallback responses")
        
        logger.info("🎉 EdgeSoul API ready!")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("👋 Shutting down EdgeSoul API...")
    await emotion_service.unload_model()
    logger.info("✅ Cleanup complete")


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "EdgeSoul Chatbot API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "analyze": "/analyze - Emotion detection only",
            "chat": "/chat - Full conversation with AI",
            "health": "/health - Health check",
            "docs": "/docs - API documentation"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    from services.knowledge_engine import knowledge_engine
    
    return {
        "status": "healthy",
        "services": {
            "emotion_detection": emotion_service.is_loaded,
            "knowledge_engine": knowledge_engine.is_available,
            "model": knowledge_engine.model_name if knowledge_engine.is_available else "fallback"
        },
        "timestamp": time.time()
    }


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_emotion(request: AnalyzeRequest):
    """
    🎭 Analyze emotion in text
    
    Fast endpoint that only detects emotion and returns confidence scores.
    Perfect for quick emotion analysis without generating responses.
    
    Returns:
        - emotion: Primary detected emotion (joy, sadness, anger, fear, love, surprise)
        - confidence: Confidence score (0-100)
        - all_emotions: Scores for all 6 emotions
        - processing_time: Time taken in seconds
    """
    start_time = time.time()
    
    try:
        # Detect emotion
        emotion_data = await emotion_service.detect_emotion(request.text)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Build response
        response = {
            "emotion": emotion_data["primary"],
            "confidence": round(emotion_data["confidence"], 2),
            "all_emotions": {
                k: round(v, 2) for k, v in emotion_data["all"].items()
            },
            "processing_time": round(processing_time, 3)
        }
        
        logger.info(f"✅ Emotion analyzed: {response['emotion']} ({response['confidence']}%) in {processing_time:.3f}s")
        
        return JSONResponse(content=response)
    
    except Exception as e:
        logger.error(f"❌ Error in /analyze: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Emotion analysis failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    💬 Full conversation endpoint
    
    Integrates emotion detection + knowledge reasoning + emotional tone adjustment.
    This is the main endpoint for your chatbot.
    
    Features:
        - Detects emotion from user message
        - Determines if it's a knowledge query or emotional expression
        - Generates appropriate response using local AI (Ollama)
        - Applies emotional tone to response based on detected emotion
        - Returns fast JSON with all metadata
    
    Returns:
        - response: Bot's reply text
        - emotion: Detected emotion data (primary, confidence, all scores)
        - response_type: "hybrid_knowledge" or "emotional_support"
        - tone: Emotional tone applied (joyful, empathetic, calm, etc.)
        - metadata: Processing time, model used, timestamp
    """
    start_time = time.time()
    
    try:
        # Process message through hybrid chat engine
        result = await hybrid_chat_engine.process_message(
            user_input=request.message,
            context=request.context
        )
        
        # Calculate total processing time
        processing_time = time.time() - start_time
        result["metadata"]["total_processing_time"] = round(processing_time, 3)
        
        logger.info(
            f"✅ Chat processed: {result['response_type']} | "
            f"Emotion: {result['emotion']['primary']} ({result['emotion']['confidence']}%) | "
            f"Time: {processing_time:.3f}s"
        )
        
        return JSONResponse(content=result)
    
    except Exception as e:
        logger.error(f"❌ Error in /chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@app.get("/analyze/{text}")
async def quick_analyze(text: str):
    """
    🚀 Quick emotion analysis (GET endpoint)
    
    Convenience endpoint for quick testing without POST request.
    Use /analyze POST endpoint for production.
    """
    try:
        emotion_data = await emotion_service.detect_emotion(text)
        return {
            "text": text,
            "emotion": emotion_data["primary"],
            "confidence": round(emotion_data["confidence"], 2),
            "all_emotions": {k: round(v, 2) for k, v in emotion_data["all"].items()}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def list_models():
    """
    📋 List available AI models
    
    Shows which models are available in Ollama.
    """
    try:
        from services.knowledge_engine import knowledge_engine
        
        if not knowledge_engine.is_available:
            return {
                "status": "ollama_not_running",
                "current_model": "fallback",
                "message": "Ollama is not running. Using fallback responses."
            }
        
        models = await knowledge_engine.list_available_models()
        
        return {
            "status": "online",
            "current_model": knowledge_engine.model_name,
            "available_models": models,
            "can_switch_to": ["tinyllama", "phi3:mini", "mistral:7b"]
        }
    
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Endpoint not found",
            "path": str(request.url),
            "available_endpoints": ["/", "/analyze", "/chat", "/health", "/docs"]
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "Something went wrong. Check server logs for details."
        }
    )


# ============================================================================
# Run App
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Starting EdgeSoul API server...")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
