from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from services.knowledge_service import knowledge_service
from models.knowledge import KnowledgeRequest, KnowledgeResponse

router = APIRouter()


@router.post("/knowledge/query", response_model=KnowledgeResponse)
async def knowledge_query(request: KnowledgeRequest):
    """
    Query the knowledge reasoning system.
    """
    try:
        logger.info(f"Knowledge query: {request.query[:50]}...")
        
        response = await knowledge_service.generate_response(
            query=request.query,
            context=request.context,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Error in knowledge query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge/health")
async def knowledge_health():
    """
    Check if knowledge reasoning model is loaded and healthy.
    """
    return {
        "status": "healthy",
        "model_loaded": knowledge_service.is_model_loaded(),
    }
