from pydantic import BaseModel, Field
from typing import Optional


class KnowledgeRequest(BaseModel):
    """Request model for knowledge reasoning."""
    query: str = Field(..., min_length=1, max_length=2000)
    context: Optional[str] = None
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=500, ge=1, le=2000)


class KnowledgeResponse(BaseModel):
    """Response model for knowledge reasoning."""
    response: str
    context_used: Optional[str] = None
    model_name: Optional[str] = None
    tokens_used: Optional[int] = None
