"""
SQLAlchemy Database Models for EdgeSoul
Persistent storage for user profiles, memories, and emotional patterns
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class DBUserProfile(Base):
    """User profile with preferences and personality settings"""
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    gender = Column(String(50), default="not_set")
    
    # Personality settings (0-100)
    empathy_level = Column(Integer, default=75)
    humor_level = Column(Integer, default=50)
    formality_level = Column(Integer, default=40)
    verbosity_level = Column(Integer, default=60)
    proactiveness_level = Column(Integer, default=50)
    
    # Communication preferences
    preferred_tone = Column(String(50), default="friendly")
    response_style = Column(String(50), default="balanced")
    emoji_usage = Column(Boolean, default=True)
    
    # Voice preferences
    voice_enabled = Column(Boolean, default=True)
    voice_speed = Column(Float, default=1.0)
    voice_pitch = Column(Float, default=1.0)
    auto_speak_responses = Column(Boolean, default=False)
    
    # Learned preferences (JSON)
    interests = Column(JSON, default=list)
    dislikes = Column(JSON, default=list)
    communication_patterns = Column(JSON, default=dict)
    
    # Statistics
    total_conversations = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    avg_session_length = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    memories = relationship("DBMemory", back_populates="user", cascade="all, delete-orphan")
    emotional_patterns = relationship("DBEmotionalPattern", back_populates="user", cascade="all, delete-orphan")
    conversation_contexts = relationship("DBConversationContext", back_populates="user", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_user_id', 'user_id'),
    )


class DBMemory(Base):
    """Individual memory entry"""
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    memory_id = Column(String(255), unique=True, nullable=False)
    user_id = Column(String(255), ForeignKey('user_profiles.user_id'), nullable=False, index=True)
    memory_type = Column(String(50), nullable=False, index=True)
    content = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    importance = Column(Float, default=0.5)
    access_count = Column(Integer, default=0)
    memory_metadata = Column(JSON, default=dict)  # Renamed from 'metadata' to avoid conflict
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("DBUserProfile", back_populates="memories")
    
    __table_args__ = (
        Index('idx_user_memory_type', 'user_id', 'memory_type'),
        Index('idx_created_at', 'created_at'),
    )


class DBEmotionalPattern(Base):
    """User's emotional patterns over time"""
    __tablename__ = "emotional_patterns"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('user_profiles.user_id'), nullable=False, index=True)
    emotion = Column(String(50), nullable=False)
    frequency = Column(Integer, default=0)
    avg_intensity = Column(Float, default=0.0)
    triggers = Column(JSON, default=list)
    time_patterns = Column(JSON, default=dict)
    trend = Column(String(50), default="stable")
    last_occurrence = Column(DateTime, nullable=True)
    
    # Relationship
    user = relationship("DBUserProfile", back_populates="emotional_patterns")
    
    __table_args__ = (
        Index('idx_user_emotion', 'user_id', 'emotion', unique=True),
    )


class DBConversationContext(Base):
    """Recent conversation context for continuity"""
    __tablename__ = "conversation_contexts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), ForeignKey('user_profiles.user_id'), nullable=False, index=True, unique=True)
    session_id = Column(String(255), nullable=False)
    messages = Column(JSON, default=list)
    topics = Column(JSON, default=list)
    current_emotion = Column(String(50), nullable=True)
    emotion_trajectory = Column(JSON, default=list)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("DBUserProfile", back_populates="conversation_contexts")
    
    __table_args__ = (
        Index('idx_user_context', 'user_id'),
    )
