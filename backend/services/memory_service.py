"""
Long-term Memory Service for EdgeSoul v3.0
Tracks user preferences, emotional patterns, and conversation history
Enables personalization and context-aware responses
"""

from typing import Dict, List, Optional, Any, Tuple
from loguru import logger
from datetime import datetime, timedelta
import json
from collections import defaultdict, Counter
import re

from models.memory import (
    Memory, MemoryType, EmotionalPattern, ConversationContext,
    UserProfile, MemorySearchQuery, MemorySearchResult,
    PreferenceUpdate, EmotionSummary
)
from database.repository import memory_repository


class MemoryService:
    """
    Intelligent memory system that learns from conversations.
    Stores preferences, patterns, and context for personalization.
    Now uses persistent SQLite database.
    """
    
    def __init__(self):
        # Use database repository for persistent storage
        self.repository = memory_repository
        
        logger.info("Memory Service initialized with database persistence")
    
    # ==================== USER PROFILE ====================
    
    def get_or_create_profile(self, user_id: str) -> UserProfile:
        """Get user profile or create new one"""
        profile = self.repository.get_user_profile(user_id)
        if not profile:
            profile = self.repository.create_user_profile(user_id)
            logger.info(f"Created new profile for user: {user_id}")
        return profile
    
    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> UserProfile:
        """Update user profile with new settings"""
        profile = self.repository.update_user_profile(user_id, updates)
        logger.info(f"Updated profile for {user_id}: {list(updates.keys())}")
        return profile
    
    # ==================== MEMORY STORAGE ====================
    
    def add_memory(
        self,
        user_id: str,
        memory_type: MemoryType,
        content: str,
        context: Optional[str] = None,
        confidence: float = 0.8,
        importance: float = 0.5,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Memory:
        """Add a new memory"""
        memory = Memory(
            id=f"{user_id}_{datetime.now().timestamp()}",
            user_id=user_id,
            memory_type=memory_type,
            content=content,
            context=context,
            confidence=confidence,
            importance=importance,
            metadata=metadata or {}
        )
        
        self.repository.add_memory(memory)
        logger.info(f"Added {memory_type} memory for {user_id}: {content[:50]}")
        
        return memory
    
    def search_memories(
        self,
        user_id: str,
        query: str,
        memory_types: Optional[List[MemoryType]] = None,
        limit: int = 5,
        min_confidence: float = 0.3
    ) -> List[Memory]:
        """Search user's memories by query"""
        return self.repository.search_memories(
            user_id=user_id,
            query=query,
            memory_types=memory_types,
            limit=limit,
            min_confidence=min_confidence
        )
    
    def get_recent_memories(
        self,
        user_id: str,
        memory_types: Optional[List[MemoryType]] = None,
        days: int = 7,
        limit: int = 10
    ) -> List[Memory]:
        """Get recent memories within time window"""
        return self.repository.get_recent_memories(
            user_id=user_id,
            memory_types=memory_types,
            days=days,
            limit=limit
        )
    
    # ==================== PREFERENCE LEARNING ====================
    
    def learn_preference(self, user_id: str, message: str, response: str) -> Optional[Memory]:
        """Automatically detect and learn user preferences from conversation"""
        message_lower = message.lower()
        
        # Pattern detection for preferences
        preference_patterns = {
            # Communication style
            r"i (like|prefer|enjoy) (detailed|brief|short|long) (answers|responses|explanations)": ("verbosity", "preference"),
            r"keep it (brief|short|concise)": ("verbosity", "low"),
            r"give me more (details|information)": ("verbosity", "high"),
            
            # Tone preferences
            r"be more (formal|professional)": ("formality", "high"),
            r"you can be (casual|informal)": ("formality", "low"),
            r"don'?t be so (formal|serious)": ("formality", "low"),
            
            # Humor
            r"i (love|like|enjoy) (jokes|humor|funny)": ("humor", "high"),
            r"(less|fewer) jokes": ("humor", "low"),
            
            # Emoji usage
            r"(stop using|no) emojis": ("emoji_usage", False),
            r"i like emojis": ("emoji_usage", True),
            
            # Interests
            r"i'?m interested in (.+)": ("interest", "extract"),
            r"i (love|like|enjoy) (.+)": ("interest", "extract"),
            r"i don'?t like (.+)": ("dislike", "extract"),
        }
        
        for pattern, (pref_type, action) in preference_patterns.items():
            match = re.search(pattern, message_lower)
            if match:
                content = f"User prefers {pref_type}: {action}"
                
                if action == "extract" and len(match.groups()) > 0:
                    extracted = match.group(match.lastindex).strip()
                    content = f"User {pref_type}: {extracted}"
                
                memory = self.add_memory(
                    user_id=user_id,
                    memory_type=MemoryType.PREFERENCE,
                    content=content,
                    context=message,
                    confidence=0.8,
                    importance=0.7
                )
                
                # Update profile immediately
                self._apply_preference_to_profile(user_id, pref_type, action)
                
                return memory
        
        return None
    
    def _apply_preference_to_profile(self, user_id: str, pref_type: str, value: Any):
        """Apply learned preference to user profile"""
        profile = self.get_or_create_profile(user_id)
        
        updates = {}
        
        if pref_type == "verbosity":
            if value == "high":
                updates["verbosity_level"] = min(profile.verbosity_level + 20, 100)
            elif value == "low":
                updates["verbosity_level"] = max(profile.verbosity_level - 20, 0)
        
        elif pref_type == "formality":
            if value == "high":
                updates["formality_level"] = min(profile.formality_level + 20, 100)
            elif value == "low":
                updates["formality_level"] = max(profile.formality_level - 20, 0)
        
        elif pref_type == "humor":
            if value == "high":
                updates["humor_level"] = min(profile.humor_level + 20, 100)
            elif value == "low":
                updates["humor_level"] = max(profile.humor_level - 20, 0)
        
        elif pref_type == "emoji_usage":
            updates["emoji_usage"] = value
        
        elif pref_type == "interest" and isinstance(value, str):
            if value not in profile.interests:
                profile.interests.append(value)
        
        elif pref_type == "dislike" and isinstance(value, str):
            if value not in profile.dislikes:
                profile.dislikes.append(value)
        
        if updates:
            self.update_profile(user_id, updates)
    
    # ==================== EMOTIONAL PATTERNS ====================
    
    def track_emotion(
        self,
        user_id: str,
        emotion: str,
        intensity: float,
        context: Optional[str] = None
    ):
        """Track emotional occurrences and patterns"""
        # Get or create pattern
        pattern = self.repository.get_emotional_pattern(user_id, emotion)
        if not pattern:
            pattern = EmotionalPattern(
                user_id=user_id,
                emotion=emotion
            )
        
        pattern.frequency += 1
        
        # Update average intensity
        pattern.avg_intensity = (
            (pattern.avg_intensity * (pattern.frequency - 1) + intensity) / pattern.frequency
        )
        
        # Track triggers (simple keyword extraction from context)
        if context:
            keywords = self._extract_keywords(context)
            for keyword in keywords:
                if keyword not in pattern.triggers:
                    pattern.triggers.append(keyword)
                if len(pattern.triggers) > 10:  # Keep top 10
                    pattern.triggers = pattern.triggers[:10]
        
        # Track time patterns
        hour = datetime.now().hour
        time_slot = f"{hour:02d}:00"
        pattern.time_patterns[time_slot] = pattern.time_patterns.get(time_slot, 0) + 1
        
        pattern.last_occurrence = datetime.now()
        
        # Save to database
        self.repository.save_emotional_pattern(pattern)
        
        logger.debug(f"Tracked {emotion} for {user_id}: intensity={intensity:.2f}")
    
    def get_emotional_patterns(self, user_id: str) -> Dict[str, EmotionalPattern]:
        """Get all emotional patterns for a user"""
        return self.repository.get_all_emotional_patterns(user_id)
    
    def get_emotion_summary(self, user_id: str, days: int = 7) -> Optional[EmotionSummary]:
        """Generate emotion summary for time period"""
        patterns = self.get_emotional_patterns(user_id)
        
        if not patterns:
            return None
        
        # Calculate emotion distribution
        total_occurrences = sum(p.frequency for p in patterns.values())
        distribution = {
            emotion: (pattern.frequency / total_occurrences) * 100
            for emotion, pattern in patterns.items()
        }
        
        # Find dominant emotion
        dominant = max(distribution.items(), key=lambda x: x[1])[0]
        
        # Determine mood trend (simplified - could be enhanced)
        positive_emotions = ['joy', 'love', 'surprise']
        negative_emotions = ['sadness', 'anger', 'fear']
        
        positive_score = sum(distribution.get(e, 0) for e in positive_emotions)
        negative_score = sum(distribution.get(e, 0) for e in negative_emotions)
        
        if positive_score > negative_score * 1.5:
            trend = "improving"
        elif negative_score > positive_score * 1.5:
            trend = "declining"
        else:
            trend = "stable"
        
        # Notable patterns
        notable = []
        for emotion, pattern in patterns.items():
            if pattern.frequency >= 5:
                notable.append(f"Frequent {emotion} ({pattern.frequency} times)")
            if pattern.triggers:
                notable.append(f"{emotion.capitalize()} triggers: {', '.join(pattern.triggers[:3])}")
        
        return EmotionSummary(
            user_id=user_id,
            time_period=f"{days} days",
            dominant_emotion=dominant,
            emotion_distribution=distribution,
            mood_trend=trend,
            notable_patterns=notable
        )
    
    # ==================== CONVERSATION CONTEXT ====================
    
    def update_conversation_context(
        self,
        user_id: str,
        session_id: str,
        message: str,
        response: str,
        emotion: Optional[str] = None
    ):
        """Update conversation context for continuity"""
        # Get or create context
        context = self.repository.get_conversation_context(user_id)
        if not context:
            context = ConversationContext(
                user_id=user_id,
                session_id=session_id
            )
        
        # Add message pair (keep last 10)
        context.messages.append({
            "user": message,
            "assistant": response,
            "timestamp": datetime.now().isoformat(),
            "emotion": emotion
        })
        
        if len(context.messages) > 10:
            context.messages = context.messages[-10:]
        
        # Track topics (simple keyword extraction)
        topics = self._extract_keywords(message)
        for topic in topics:
            if topic not in context.topics:
                context.topics.append(topic)
            if len(context.topics) > 15:
                context.topics = context.topics[-15:]
        
        # Track emotion trajectory
        if emotion:
            context.current_emotion = emotion
            context.emotion_trajectory.append(emotion)
            if len(context.emotion_trajectory) > 20:
                context.emotion_trajectory = context.emotion_trajectory[-20:]
        
        context.last_activity = datetime.now()
        
        # Save to database
        self.repository.save_conversation_context(context)
    
    def get_conversation_context(self, user_id: str) -> Optional[ConversationContext]:
        """Get current conversation context"""
        return self.repository.get_conversation_context(user_id)
    
    def get_context_summary(self, user_id: str, max_messages: int = 5) -> str:
        """Get formatted context summary for LLM injection"""
        context = self.get_conversation_context(user_id)
        
        if not context or not context.messages:
            return ""
        
        recent_messages = context.messages[-max_messages:]
        
        summary_parts = []
        
        # Add recent conversation
        if recent_messages:
            summary_parts.append("Recent conversation:")
            for msg in recent_messages[-3:]:
                summary_parts.append(f"User: {msg['user'][:100]}")
                summary_parts.append(f"You: {msg['assistant'][:100]}")
        
        # Add topics
        if context.topics:
            summary_parts.append(f"\nDiscussed topics: {', '.join(context.topics[-5:])}")
        
        # Add emotion trajectory
        if context.emotion_trajectory:
            recent_emotions = context.emotion_trajectory[-5:]
            emotion_summary = Counter(recent_emotions).most_common(2)
            summary_parts.append(f"Recent emotions: {', '.join([f'{e[0]} ({e[1]}x)' for e in emotion_summary])}")
        
        return "\n".join(summary_parts)
    
    # ==================== HELPER METHODS ====================
    
    def _extract_keywords(self, text: str, max_keywords: int = 5) -> List[str]:
        """Extract keywords from text (simple implementation)"""
        # Remove common words
        stopwords = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'i', 'you', 'my', 'me'}
        
        words = re.findall(r'\b\w+\b', text.lower())
        keywords = [w for w in words if len(w) > 3 and w not in stopwords]
        
        # Get most common
        keyword_counts = Counter(keywords)
        return [k for k, _ in keyword_counts.most_common(max_keywords)]
    
    # ==================== STATISTICS ====================
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user statistics"""
        profile = self.get_or_create_profile(user_id)
        memories = self.repository.get_all_memories(user_id)
        patterns = self.get_emotional_patterns(user_id)
        context = self.get_conversation_context(user_id)
        
        return {
            "user_id": user_id,
            "profile": {
                "name": profile.name,
                "total_conversations": profile.total_conversations,
                "total_messages": profile.total_messages,
                "preferences": {
                    "empathy": profile.empathy_level,
                    "humor": profile.humor_level,
                    "formality": profile.formality_level,
                    "verbosity": profile.verbosity_level,
                }
            },
            "memory": {
                "total_memories": len(memories),
                "by_type": {
                    mtype.value: len([m for m in memories if m.memory_type == mtype])
                    for mtype in MemoryType
                },
                "recent_count": len(self.get_recent_memories(user_id, days=7))
            },
            "emotions": {
                "patterns_tracked": len(patterns),
                "most_common": max(patterns.items(), key=lambda x: x[1].frequency)[0] if patterns else None,
                "total_occurrences": sum(p.frequency for p in patterns.values()) if patterns else 0
            },
            "conversation": {
                "current_session": context.session_id if context else None,
                "message_count": len(context.messages) if context else 0,
                "topics": context.topics[-5:] if context else [],
                "current_emotion": context.current_emotion if context else None
            }
        }


# Global instance
memory_service = MemoryService()
