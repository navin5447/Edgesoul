"""
Memory Models for EdgeSoul v3.0
Defines data structures for long-term user memory and personalization
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class MemoryType(str, Enum):
    """Types of memories stored"""
    PREFERENCE = "preference"  # User preferences (tone, humor, etc.)
    PATTERN = "pattern"  # Behavioral/emotional patterns
    FACT = "fact"  # User-shared facts (name, interests, etc.)
    CONVERSATION = "conversation"  # Important conversation topics
    EMOTIONAL = "emotional"  # Emotional triggers and responses


class Memory(BaseModel):
    """Individual memory entry"""
    id: str
    user_id: str
    memory_type: MemoryType
    content: str
    context: Optional[str] = None
    confidence: float = 1.0  # 0-1, how certain we are about this memory
    importance: float = 0.5  # 0-1, how important this memory is
    created_at: datetime = Field(default_factory=datetime.now)
    last_accessed: datetime = Field(default_factory=datetime.now)
    access_count: int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EmotionalPattern(BaseModel):
    """User's emotional patterns over time"""
    user_id: str
    emotion: str  # joy, sadness, anger, etc.
    frequency: int = 0  # How often this emotion appears
    avg_intensity: float = 0.0  # Average intensity (0-100)
    triggers: List[str] = Field(default_factory=list)  # Topics that trigger this
    time_patterns: Dict[str, int] = Field(default_factory=dict)  # Time of day patterns
    last_occurrence: Optional[datetime] = None
    trend: str = "stable"  # increasing, decreasing, stable


class ConversationContext(BaseModel):
    """Recent conversation context for continuity"""
    user_id: str
    session_id: str
    messages: List[Dict[str, Any]] = Field(default_factory=list)  # Last N messages
    topics: List[str] = Field(default_factory=list)  # Detected topics
    current_emotion: Optional[str] = None
    emotion_trajectory: List[str] = Field(default_factory=list)  # Emotion changes
    started_at: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)


class UserProfile(BaseModel):
    """User profile with preferences and personality settings"""
    user_id: str
    name: Optional[str] = None
    
    # Gender preference for UI and bot personality
    gender: str = "not_set"  # "male", "female", "other", "not_set"
    
    # Personality sliders (0-100)
    empathy_level: int = 75
    humor_level: int = 50
    formality_level: int = 40
    verbosity_level: int = 60
    proactiveness_level: int = 50
    
    # Communication preferences
    preferred_tone: str = "friendly"  # friendly, professional, casual
    response_style: str = "balanced"  # concise, balanced, detailed
    emoji_usage: bool = True
    
    # Voice preferences
    voice_enabled: bool = True  # Enable/disable voice features
    voice_speed: float = 1.0  # Speech rate (0.5 to 2.0)
    voice_pitch: float = 1.0  # Voice pitch (0.0 to 2.0)
    auto_speak_responses: bool = False  # Auto-read bot responses aloud
    
    # Tracked preferences (learned over time)
    interests: List[str] = Field(default_factory=list)
    dislikes: List[str] = Field(default_factory=list)
    communication_patterns: Dict[str, Any] = Field(default_factory=dict)
    
    # Statistics
    total_conversations: int = 0
    total_messages: int = 0
    avg_session_length: float = 0.0  # minutes
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class MemorySearchQuery(BaseModel):
    """Query for searching memories"""
    user_id: str
    query: str
    memory_types: Optional[List[MemoryType]] = None
    limit: int = 5
    min_confidence: float = 0.3


class MemorySearchResult(BaseModel):
    """Result from memory search"""
    memories: List[Memory]
    total_found: int
    search_time: float  # seconds


class PreferenceUpdate(BaseModel):
    """Update user preferences"""
    user_id: str
    preference_type: str
    preference_value: Any
    context: Optional[str] = None
    confidence: float = 0.8


class EmotionSummary(BaseModel):
    """Summary of user's emotional state over time"""
    user_id: str
    time_period: str  # day, week, month
    dominant_emotion: str
    emotion_distribution: Dict[str, float]
    mood_trend: str  # improving, declining, stable
    notable_patterns: List[str]
    generated_at: datetime = Field(default_factory=datetime.now)
