"""Shared utility functions for EdgeSoul v2."""

import re
from typing import Optional
from datetime import datetime, timedelta


def sanitize_text(text: str) -> str:
    """
    Sanitize text input.
    
    Args:
        text: Raw text input
        
    Returns:
        Sanitized text
    """
    # Remove control characters
    text = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', text)
    
    # Remove excessive whitespace
    text = ' '.join(text.split())
    
    return text.strip()


def truncate_text(text: str, max_length: int, suffix: str = "...") -> str:
    """
    Truncate text to maximum length.
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix to append if truncated
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def format_timestamp(dt: datetime) -> str:
    """
    Format datetime to human-readable string.
    
    Args:
        dt: Datetime object
        
    Returns:
        Formatted string
    """
    now = datetime.now()
    diff = now - dt
    
    if diff < timedelta(minutes=1):
        return "just now"
    elif diff < timedelta(hours=1):
        minutes = int(diff.total_seconds() / 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif diff < timedelta(days=1):
        hours = int(diff.total_seconds() / 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif diff < timedelta(days=7):
        days = int(diff.total_seconds() / 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"
    else:
        return dt.strftime("%Y-%m-%d %H:%M")


def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address
        
    Returns:
        True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def generate_session_id() -> str:
    """
    Generate a unique session ID.
    
    Returns:
        Session ID string
    """
    import uuid
    return str(uuid.uuid4())


def calculate_confidence_level(confidence: float) -> str:
    """
    Convert confidence score to human-readable level.
    
    Args:
        confidence: Confidence score (0-1)
        
    Returns:
        Confidence level string
    """
    if confidence >= 0.9:
        return "Very High"
    elif confidence >= 0.7:
        return "High"
    elif confidence >= 0.5:
        return "Medium"
    elif confidence >= 0.3:
        return "Low"
    else:
        return "Very Low"
