"""
Database Repository for Memory Operations
Handles CRUD operations for user profiles, memories, and patterns
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from loguru import logger
from sqlalchemy import desc, and_

from database.models import DBUserProfile, DBMemory, DBEmotionalPattern, DBConversationContext
from database.database_service import db_service
from models.memory import (
    UserProfile, Memory, MemoryType, EmotionalPattern, ConversationContext
)


class MemoryRepository:
    """Repository for memory-related database operations"""
    
    # ==================== USER PROFILE ====================
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile from database"""
        try:
            with db_service.get_session() as session:
                db_profile = session.query(DBUserProfile).filter(
                    DBUserProfile.user_id == user_id
                ).first()
                
                if not db_profile:
                    return None
                
                return self._db_profile_to_model(db_profile)
        except Exception as e:
            logger.error(f"Error getting profile for {user_id}: {e}")
            return None
    
    def create_user_profile(self, user_id: str) -> UserProfile:
        """Create new user profile"""
        try:
            with db_service.get_session() as session:
                db_profile = DBUserProfile(user_id=user_id)
                session.add(db_profile)
                session.flush()
                
                profile = self._db_profile_to_model(db_profile)
                logger.info(f"Created profile for {user_id}")
                return profile
        except Exception as e:
            logger.error(f"Error creating profile for {user_id}: {e}")
            raise
    
    def update_user_profile(self, user_id: str, updates: Dict[str, Any]) -> UserProfile:
        """Update user profile"""
        try:
            with db_service.get_session() as session:
                db_profile = session.query(DBUserProfile).filter(
                    DBUserProfile.user_id == user_id
                ).first()
                
                if not db_profile:
                    raise ValueError(f"Profile not found for {user_id}")
                
                # Update fields
                for key, value in updates.items():
                    if hasattr(db_profile, key):
                        setattr(db_profile, key, value)
                
                db_profile.updated_at = datetime.utcnow()
                session.flush()
                
                return self._db_profile_to_model(db_profile)
        except Exception as e:
            logger.error(f"Error updating profile for {user_id}: {e}")
            raise
    
    # ==================== MEMORY ====================
    
    def add_memory(self, memory: Memory) -> Memory:
        """Add new memory to database"""
        try:
            with db_service.get_session() as session:
                db_memory = DBMemory(
                    memory_id=memory.id,
                    user_id=memory.user_id,
                    memory_type=memory.memory_type.value,
                    content=memory.content,
                    context=memory.context,
                    confidence=memory.confidence,
                    importance=memory.importance,
                    memory_metadata=memory.metadata,  # Use renamed field
                    created_at=memory.created_at,
                    last_accessed=memory.last_accessed,
                    access_count=memory.access_count
                )
                session.add(db_memory)
                session.flush()
                
                return memory
        except Exception as e:
            logger.error(f"Error adding memory: {e}")
            raise
    
    def search_memories(
        self,
        user_id: str,
        query: str,
        memory_types: Optional[List[MemoryType]] = None,
        limit: int = 5,
        min_confidence: float = 0.3
    ) -> List[Memory]:
        """Search memories by text query"""
        try:
            with db_service.get_session() as session:
                q = session.query(DBMemory).filter(
                    DBMemory.user_id == user_id,
                    DBMemory.confidence >= min_confidence
                )
                
                if memory_types:
                    type_values = [mt.value for mt in memory_types]
                    q = q.filter(DBMemory.memory_type.in_(type_values))
                
                # Text search in content and context
                query_lower = f"%{query.lower()}%"
                q = q.filter(
                    DBMemory.content.ilike(query_lower) | 
                    DBMemory.context.ilike(query_lower)
                )
                
                # Order by importance and recency
                q = q.order_by(desc(DBMemory.importance), desc(DBMemory.created_at))
                q = q.limit(limit)
                
                memories = []
                for db_mem in q.all():
                    # Update access tracking
                    db_mem.last_accessed = datetime.utcnow()
                    db_mem.access_count += 1
                    memories.append(self._db_memory_to_model(db_mem))
                
                return memories
        except Exception as e:
            logger.error(f"Error searching memories: {e}")
            return []
    
    def get_recent_memories(
        self,
        user_id: str,
        memory_types: Optional[List[MemoryType]] = None,
        days: int = 7,
        limit: int = 10
    ) -> List[Memory]:
        """Get recent memories"""
        try:
            with db_service.get_session() as session:
                cutoff_date = datetime.utcnow() - timedelta(days=days)
                
                q = session.query(DBMemory).filter(
                    DBMemory.user_id == user_id,
                    DBMemory.created_at >= cutoff_date
                )
                
                if memory_types:
                    type_values = [mt.value for mt in memory_types]
                    q = q.filter(DBMemory.memory_type.in_(type_values))
                
                q = q.order_by(desc(DBMemory.created_at)).limit(limit)
                
                return [self._db_memory_to_model(m) for m in q.all()]
        except Exception as e:
            logger.error(f"Error getting recent memories: {e}")
            return []
    
    def get_all_memories(self, user_id: str) -> List[Memory]:
        """Get all memories for a user"""
        try:
            with db_service.get_session() as session:
                q = session.query(DBMemory).filter(DBMemory.user_id == user_id)
                return [self._db_memory_to_model(m) for m in q.all()]
        except Exception as e:
            logger.error(f"Error getting all memories: {e}")
            return []
    
    # ==================== EMOTIONAL PATTERNS ====================
    
    def get_emotional_pattern(self, user_id: str, emotion: str) -> Optional[EmotionalPattern]:
        """Get emotional pattern for specific emotion"""
        try:
            with db_service.get_session() as session:
                db_pattern = session.query(DBEmotionalPattern).filter(
                    DBEmotionalPattern.user_id == user_id,
                    DBEmotionalPattern.emotion == emotion
                ).first()
                
                if not db_pattern:
                    return None
                
                return self._db_pattern_to_model(db_pattern)
        except Exception as e:
            logger.error(f"Error getting emotional pattern: {e}")
            return None
    
    def save_emotional_pattern(self, pattern: EmotionalPattern) -> EmotionalPattern:
        """Save or update emotional pattern"""
        try:
            with db_service.get_session() as session:
                db_pattern = session.query(DBEmotionalPattern).filter(
                    DBEmotionalPattern.user_id == pattern.user_id,
                    DBEmotionalPattern.emotion == pattern.emotion
                ).first()
                
                if db_pattern:
                    # Update existing
                    db_pattern.frequency = pattern.frequency
                    db_pattern.avg_intensity = pattern.avg_intensity
                    db_pattern.triggers = pattern.triggers
                    db_pattern.time_patterns = pattern.time_patterns
                    db_pattern.trend = pattern.trend
                    db_pattern.last_occurrence = pattern.last_occurrence
                else:
                    # Create new
                    db_pattern = DBEmotionalPattern(
                        user_id=pattern.user_id,
                        emotion=pattern.emotion,
                        frequency=pattern.frequency,
                        avg_intensity=pattern.avg_intensity,
                        triggers=pattern.triggers,
                        time_patterns=pattern.time_patterns,
                        trend=pattern.trend,
                        last_occurrence=pattern.last_occurrence
                    )
                    session.add(db_pattern)
                
                session.flush()
                return pattern
        except Exception as e:
            logger.error(f"Error saving emotional pattern: {e}")
            raise
    
    def get_all_emotional_patterns(self, user_id: str) -> Dict[str, EmotionalPattern]:
        """Get all emotional patterns for user"""
        try:
            with db_service.get_session() as session:
                patterns = session.query(DBEmotionalPattern).filter(
                    DBEmotionalPattern.user_id == user_id
                ).all()
                
                return {
                    p.emotion: self._db_pattern_to_model(p)
                    for p in patterns
                }
        except Exception as e:
            logger.error(f"Error getting all patterns: {e}")
            return {}
    
    # ==================== CONVERSATION CONTEXT ====================
    
    def get_conversation_context(self, user_id: str) -> Optional[ConversationContext]:
        """Get conversation context"""
        try:
            with db_service.get_session() as session:
                db_context = session.query(DBConversationContext).filter(
                    DBConversationContext.user_id == user_id
                ).first()
                
                if not db_context:
                    return None
                
                return self._db_context_to_model(db_context)
        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            return None
    
    def save_conversation_context(self, context: ConversationContext) -> ConversationContext:
        """Save or update conversation context"""
        try:
            with db_service.get_session() as session:
                db_context = session.query(DBConversationContext).filter(
                    DBConversationContext.user_id == context.user_id
                ).first()
                
                if db_context:
                    # Update existing
                    db_context.session_id = context.session_id
                    db_context.messages = context.messages
                    db_context.topics = context.topics
                    db_context.current_emotion = context.current_emotion
                    db_context.emotion_trajectory = context.emotion_trajectory
                    db_context.last_activity = context.last_activity
                else:
                    # Create new
                    db_context = DBConversationContext(
                        user_id=context.user_id,
                        session_id=context.session_id,
                        messages=context.messages,
                        topics=context.topics,
                        current_emotion=context.current_emotion,
                        emotion_trajectory=context.emotion_trajectory,
                        started_at=context.started_at,
                        last_activity=context.last_activity
                    )
                    session.add(db_context)
                
                session.flush()
                return context
        except Exception as e:
            logger.error(f"Error saving conversation context: {e}")
            raise
    
    # ==================== CONVERSION HELPERS ====================
    
    def _db_profile_to_model(self, db_profile: DBUserProfile) -> UserProfile:
        """Convert DB profile to Pydantic model"""
        return UserProfile(
            user_id=db_profile.user_id,
            name=db_profile.name,
            gender=db_profile.gender,
            empathy_level=db_profile.empathy_level,
            humor_level=db_profile.humor_level,
            formality_level=db_profile.formality_level,
            verbosity_level=db_profile.verbosity_level,
            proactiveness_level=db_profile.proactiveness_level,
            preferred_tone=db_profile.preferred_tone,
            response_style=db_profile.response_style,
            emoji_usage=db_profile.emoji_usage,
            voice_enabled=db_profile.voice_enabled,
            voice_speed=db_profile.voice_speed,
            voice_pitch=db_profile.voice_pitch,
            auto_speak_responses=db_profile.auto_speak_responses,
            interests=db_profile.interests or [],
            dislikes=db_profile.dislikes or [],
            communication_patterns=db_profile.communication_patterns or {},
            total_conversations=db_profile.total_conversations,
            total_messages=db_profile.total_messages,
            avg_session_length=db_profile.avg_session_length,
            created_at=db_profile.created_at,
            updated_at=db_profile.updated_at
        )
    
    def _db_memory_to_model(self, db_memory: DBMemory) -> Memory:
        """Convert DB memory to Pydantic model"""
        return Memory(
            id=db_memory.memory_id,
            user_id=db_memory.user_id,
            memory_type=MemoryType(db_memory.memory_type),
            content=db_memory.content,
            context=db_memory.context,
            confidence=db_memory.confidence,
            importance=db_memory.importance,
            created_at=db_memory.created_at,
            last_accessed=db_memory.last_accessed,
            access_count=db_memory.access_count,
            metadata=db_memory.memory_metadata or {}  # Use renamed field
        )
    
    def _db_pattern_to_model(self, db_pattern: DBEmotionalPattern) -> EmotionalPattern:
        """Convert DB pattern to Pydantic model"""
        return EmotionalPattern(
            user_id=db_pattern.user_id,
            emotion=db_pattern.emotion,
            frequency=db_pattern.frequency,
            avg_intensity=db_pattern.avg_intensity,
            triggers=db_pattern.triggers or [],
            time_patterns=db_pattern.time_patterns or {},
            trend=db_pattern.trend,
            last_occurrence=db_pattern.last_occurrence
        )
    
    def _db_context_to_model(self, db_context: DBConversationContext) -> ConversationContext:
        """Convert DB context to Pydantic model"""
        return ConversationContext(
            user_id=db_context.user_id,
            session_id=db_context.session_id,
            messages=db_context.messages or [],
            topics=db_context.topics or [],
            current_emotion=db_context.current_emotion,
            emotion_trajectory=db_context.emotion_trajectory or [],
            started_at=db_context.started_at,
            last_activity=db_context.last_activity
        )


# Global instance
memory_repository = MemoryRepository()
