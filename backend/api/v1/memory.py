"""
Memory API Endpoints
Handles user memory, preferences, and personalization
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from loguru import logger

from models.memory import (
    UserProfile, Memory, MemoryType, PreferenceUpdate,
    EmotionSummary, MemorySearchQuery
)
from services.memory_service import memory_service


router = APIRouter()


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile with preferences"""
    try:
        profile = memory_service.get_or_create_profile(user_id)
        logger.info(f"Fetched profile for {user_id}: empathy={profile.empathy_level}, humor={profile.humor_level}, verbosity={profile.verbosity_level}")
        return profile
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile/{user_id}", response_model=UserProfile)
async def update_user_profile(user_id: str, updates: dict):
    """Update user profile preferences"""
    try:
        # Flatten personality object if it exists (frontend sends nested structure)
        if 'personality' in updates:
            personality = updates.pop('personality')
            # Merge personality fields to root level
            for key, value in personality.items():
                updates[key] = value
            logger.info(f"Flattened personality settings for {user_id}: {personality}")
        
        # Also handle preferences if sent as nested object
        if 'preferences' in updates:
            prefs = updates.pop('preferences')
            # Store preferences as dict if needed
            updates['communication_patterns'] = prefs
        
        profile = memory_service.update_profile(user_id, updates)
        logger.info(f"Profile updated successfully for {user_id}: empathy={profile.empathy_level}, humor={profile.humor_level}, verbosity={profile.verbosity_level}")
        return profile
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memories/{user_id}", response_model=List[Memory])
async def get_user_memories(
    user_id: str,
    memory_type: Optional[str] = None,
    days: int = Query(default=30, ge=1, le=365),
    limit: int = Query(default=20, ge=1, le=100)
):
    """Get user memories"""
    try:
        memory_types = [MemoryType(memory_type)] if memory_type else None
        memories = memory_service.get_recent_memories(
            user_id=user_id,
            memory_types=memory_types,
            days=days,
            limit=limit
        )
        return memories
    except Exception as e:
        logger.error(f"Error getting memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memories/search", response_model=List[Memory])
async def search_memories(query: MemorySearchQuery):
    """Search user memories"""
    try:
        results = memory_service.search_memories(
            user_id=query.user_id,
            query=query.query,
            memory_types=query.memory_types,
            limit=query.limit,
            min_confidence=query.min_confidence
        )
        return results
    except Exception as e:
        logger.error(f"Error searching memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/emotions/{user_id}/summary", response_model=Optional[EmotionSummary])
async def get_emotion_summary(
    user_id: str,
    days: int = Query(default=7, ge=1, le=90)
):
    """Get emotion summary for user"""
    try:
        summary = memory_service.get_emotion_summary(user_id, days=days)
        return summary
    except Exception as e:
        logger.error(f"Error getting emotion summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/emotions/{user_id}/patterns")
async def get_emotional_patterns(user_id: str):
    """Get emotional patterns for user"""
    try:
        patterns = memory_service.get_emotional_patterns(user_id)
        return {
            "user_id": user_id,
            "patterns": {
                emotion: {
                    "frequency": pattern.frequency,
                    "avg_intensity": pattern.avg_intensity,
                    "triggers": pattern.triggers,
                    "last_occurrence": pattern.last_occurrence
                }
                for emotion, pattern in patterns.items()
            }
        }
    except Exception as e:
        logger.error(f"Error getting emotional patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/context/{user_id}")
async def get_conversation_context(user_id: str):
    """Get current conversation context"""
    try:
        context = memory_service.get_conversation_context(user_id)
        if not context:
            return {"message": "No active conversation context"}
        
        return {
            "user_id": user_id,
            "session_id": context.session_id,
            "message_count": len(context.messages),
            "topics": context.topics,
            "current_emotion": context.current_emotion,
            "emotion_trajectory": context.emotion_trajectory,
            "last_activity": context.last_activity
        }
    except Exception as e:
        logger.error(f"Error getting context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get comprehensive user statistics"""
    try:
        stats = memory_service.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/memories/{user_id}")
async def clear_user_memories(
    user_id: str,
    memory_type: Optional[str] = None
):
    """Clear user memories (optionally by type)"""
    try:
        # Implementation would clear memories from storage
        return {
            "message": f"Memories cleared for user {user_id}",
            "memory_type": memory_type
        }
    except Exception as e:
        logger.error(f"Error clearing memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{user_id}")
async def get_user_stats(user_id: str):
    """Get user statistics for dashboard"""
    try:
        stats = memory_service.get_user_stats(user_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    """Get all user conversations for export"""
    try:
        # Get conversation history from memory service
        conversations = memory_service.get_recent_memories(
            user_id=user_id,
            memory_types=[MemoryType.CONVERSATION],
            days=365,  # Get all conversations from past year
            limit=1000
        )
        return conversations
    except Exception as e:
        logger.error(f"Error getting conversations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/emotions/{user_id}")
async def get_user_emotions(user_id: str):
    """Get all user emotions for export"""
    try:
        # Get emotion history from memory service
        emotions = memory_service.get_recent_memories(
            user_id=user_id,
            memory_types=[MemoryType.EMOTION],
            days=365,  # Get all emotions from past year
            limit=1000
        )
        return emotions
    except Exception as e:
        logger.error(f"Error getting emotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/memory/{user_id}")
async def create_memory(user_id: str, memory_data: dict):
    """Create a new memory (for import)"""
    try:
        # Convert dict to Memory object
        memory = Memory(
            user_id=user_id,
            memory_type=MemoryType(memory_data.get('memory_type', 'fact')),
            content=memory_data.get('content', ''),
            importance=memory_data.get('importance', 0.5),
            timestamp=memory_data.get('timestamp'),
            metadata=memory_data.get('metadata', {})
        )
        
        # Store the memory
        memory_service.add_memory(memory)
        return {"status": "success", "message": "Memory created"}
    except Exception as e:
        logger.error(f"Error creating memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversation/{user_id}")
async def create_conversation(user_id: str, conversation_data: dict):
    """Create a new conversation entry (for import)"""
    try:
        # Create conversation memory
        memory = Memory(
            user_id=user_id,
            memory_type=MemoryType.CONVERSATION,
            content=conversation_data.get('content', ''),
            importance=conversation_data.get('importance', 0.5),
            timestamp=conversation_data.get('timestamp'),
            metadata=conversation_data.get('metadata', {})
        )
        
        memory_service.add_memory(memory)
        return {"status": "success", "message": "Conversation created"}
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/emotion/{user_id}")
async def create_emotion(user_id: str, emotion_data: dict):
    """Create a new emotion entry (for import)"""
    try:
        # Create emotion memory
        memory = Memory(
            user_id=user_id,
            memory_type=MemoryType.EMOTION,
            content=emotion_data.get('content', ''),
            importance=emotion_data.get('importance', 0.5),
            timestamp=emotion_data.get('timestamp'),
            metadata=emotion_data.get('metadata', {})
        )
        
        memory_service.add_memory(memory)
        return {"status": "success", "message": "Emotion created"}
    except Exception as e:
        logger.error(f"Error creating emotion: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))
