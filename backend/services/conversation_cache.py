"""
Conversation Context Cache Service
Caches conversation context for faster continuing conversations.
Does NOT cache responses - only caches context to maintain intelligence.
"""

import time
from typing import Optional, Dict, Any
from loguru import logger
from collections import OrderedDict


class ConversationContextCache:
    """
    Caches conversation context for faster continuing conversations.
    Helps maintain conversation flow without re-analyzing context every time.
    """
    
    def __init__(self, max_sessions: int = 50, ttl: int = 300):
        """
        Initialize conversation context cache.
        
        Args:
            max_sessions: Maximum number of cached sessions (default 50)
            ttl: Time to live in seconds (default 300 = 5 minutes)
        """
        self.session_cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.max_sessions = max_sessions
        self.ttl = ttl
        self.cache_hits = 0
        self.cache_misses = 0
        
        logger.info(f"Conversation context cache initialized: max_sessions={max_sessions}, ttl={ttl}s")
    
    def get_context(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get cached conversation context if available and not expired.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Cached context or None
        """
        if session_id not in self.session_cache:
            self.cache_misses += 1
            return None
        
        cached_data = self.session_cache[session_id]
        
        # Check if cache is expired
        if time.time() - cached_data['timestamp'] > self.ttl:
            logger.debug(f"Context cache expired for session: {session_id}")
            del self.session_cache[session_id]
            self.cache_misses += 1
            return None
        
        # Move to end (most recently used)
        self.session_cache.move_to_end(session_id)
        self.cache_hits += 1
        
        logger.debug(f"Context cache HIT for session: {session_id}")
        return cached_data['context']
    
    def update_context(self, session_id: str, context: Dict[str, Any]):
        """
        Update cached conversation context.
        
        Args:
            session_id: Session identifier
            context: Context data to cache
        """
        # Remove oldest session if cache is full
        if len(self.session_cache) >= self.max_sessions and session_id not in self.session_cache:
            oldest_session = next(iter(self.session_cache))
            del self.session_cache[oldest_session]
            logger.debug(f"Context cache full, removed oldest session")
        
        # Add/update cache entry
        self.session_cache[session_id] = {
            'context': context,
            'timestamp': time.time()
        }
        
        logger.debug(f"Updated context cache for session: {session_id}")
    
    def should_refresh(self, session_id: str) -> bool:
        """
        Check if context cache should be refreshed.
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if cache should be refreshed, False otherwise
        """
        if session_id not in self.session_cache:
            return True
        
        # Refresh if older than half TTL (2.5 minutes by default)
        cache_age = time.time() - self.session_cache[session_id]['timestamp']
        return cache_age > (self.ttl / 2)
    
    def invalidate(self, session_id: Optional[str] = None):
        """
        Invalidate cache entries.
        
        Args:
            session_id: Specific session to invalidate (or None for all)
        """
        if session_id:
            if session_id in self.session_cache:
                del self.session_cache[session_id]
                logger.info(f"Invalidated context cache for session: {session_id}")
        else:
            self.session_cache.clear()
            logger.info("Cleared all context cache")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total * 100) if total > 0 else 0
        
        return {
            "active_sessions": len(self.session_cache),
            "max_sessions": self.max_sessions,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate": f"{hit_rate:.1f}%",
            "ttl_seconds": self.ttl
        }


# Global instance - 5 minute cache for conversation context
conversation_cache = ConversationContextCache(max_sessions=50, ttl=300)
