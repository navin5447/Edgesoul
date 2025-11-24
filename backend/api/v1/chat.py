from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from services.intelligent_reply_engine import intelligent_reply_engine
from models.chat import ChatRequest, ChatResponse
from core.config import settings  # Import settings

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint using the new Intelligent Reply Engine v3.0.
    Provides advanced emotion detection and intelligent response routing.
    """
    try:
        logger.info(f"Received chat message: {request.message[:50]}...")
        
        # Process the message through the intelligent reply engine
        response = await intelligent_reply_engine.generate_reply(
            message=request.message,
            user_id=request.session_id or "default",
            context=request.context,
        )
        
        # Transform to ChatResponse format
        chat_response = ChatResponse(
            message=response['message'],
            emotion=response['emotion']['primary'],
            confidence=response['emotion']['confidence'],
            all_emotions=response['emotion']['all_emotions'],
            context=response['context'],
            metadata={
                "processing_time": response['metadata']['processing_time'],
                "strategy": response['strategy'],
                "model_used": response['metadata']['model_used'],
                "timestamp": response['metadata']['timestamp'],
                "reasoning": response['metadata']['reasoning'],
                "is_emotional": response['is_emotional']
            }
        )
        
        return chat_response
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """
    Streaming chat endpoint for real-time responses.
    """
    from fastapi.responses import StreamingResponse
    import json
    import asyncio
    
    async def generate_stream():
        """Generate streaming response."""
        try:
            # Process message
            logger.info(f"Streaming chat message: {request.message[:50]}...")
            
            # Get response from intelligent reply engine
            response = await intelligent_reply_engine.generate_reply(
                message=request.message,
                user_id=request.session_id or "default",
                context=request.context,
            )
            
            # Stream the response in chunks
            message_text = response['message']
            chunk_size = settings.STREAM_CHUNK_SIZE  # Use config setting (default 5 words)
            words = message_text.split()
            
            for i in range(0, len(words), chunk_size):
                chunk_words = words[i:i + chunk_size]
                chunk = ' '.join(chunk_words)
                
                data = {
                    "chunk": chunk,
                    "done": i + chunk_size >= len(words),
                    "emotion": response['emotion']['primary'] if i == 0 else None,
                }
                
                yield f"data: {json.dumps(data)}\n\n"
                await asyncio.sleep(settings.STREAM_DELAY_MS / 1000.0)  # Convert ms to seconds
            
            # Send final completion
            final_data = {
                "chunk": "",
                "done": True,
                "metadata": response['metadata']
            }
            yield f"data: {json.dumps(final_data)}\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming: {e}")
            error_data = {"error": str(e), "done": True}
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
