"""
Response Cache Service
Caches frequent responses for instant replies to common queries.
"""

import hashlib
import time
from typing import Optional, Dict, Any
from loguru import logger
from collections import OrderedDict


class ResponseCache:
    """
    LRU (Least Recently Used) cache for chat responses.
    Caches common queries for instant responses.
    """
    
    def __init__(self, max_size: int = 100, ttl: int = 3600):
        """
        Initialize response cache.
        
        Args:
            max_size: Maximum number of cached responses (default 100)
            ttl: Time to live in seconds (default 3600 = 1 hour)
        """
        self.cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.max_size = max_size
        self.ttl = ttl
        self.hits = 0
        self.misses = 0
        
        logger.info(f"Response cache initialized: max_size={max_size}, ttl={ttl}s")
    
    def _generate_key(self, message: str, user_id: str, emotion: Optional[str] = None) -> str:
        """
        Generate cache key from message and metadata.
        
        Args:
            message: User message
            user_id: User identifier
            emotion: Detected emotion (optional)
            
        Returns:
            Cache key (MD5 hash)
        """
        # Normalize message for better cache hits
        normalized = message.lower().strip()
        
        # Include emotion in key for emotion-sensitive responses
        key_data = f"{normalized}_{emotion or 'any'}"
        
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, message: str, user_id: str, emotion: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get cached response if available and not expired.
        
        Args:
            message: User message
            user_id: User identifier
            emotion: Detected emotion
            
        Returns:
            Cached response or None
        """
        key = self._generate_key(message, user_id, emotion)
        
        if key not in self.cache:
            self.misses += 1
            return None
        
        cached_data = self.cache[key]
        
        # Check if cache is expired
        if time.time() - cached_data['timestamp'] > self.ttl:
            logger.debug(f"Cache expired for: {message[:30]}...")
            del self.cache[key]
            self.misses += 1
            return None
        
        # Move to end (most recently used)
        self.cache.move_to_end(key)
        self.hits += 1
        
        logger.info(f"Cache HIT for: {message[:30]}... (hit rate: {self.hit_rate:.1%})")
        return cached_data['response']
    
    def set(self, message: str, user_id: str, response: Dict[str, Any], emotion: Optional[str] = None):
        """
        Cache a response.
        
        Args:
            message: User message
            user_id: User identifier
            response: Response data to cache
            emotion: Detected emotion
        """
        key = self._generate_key(message, user_id, emotion)
        
        # Remove oldest if cache is full
        if len(self.cache) >= self.max_size and key not in self.cache:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            logger.debug(f"Cache full, removed oldest entry")
        
        # Add/update cache entry
        self.cache[key] = {
            'response': response,
            'timestamp': time.time()
        }
        
        logger.debug(f"Cached response for: {message[:30]}...")
    
    def invalidate(self, message: Optional[str] = None, user_id: Optional[str] = None):
        """
        Invalidate cache entries.
        
        Args:
            message: Specific message to invalidate (or None for all)
            user_id: User to invalidate (or None for all)
        """
        if message and user_id:
            # Invalidate specific entry
            key = self._generate_key(message, user_id)
            if key in self.cache:
                del self.cache[key]
                logger.info(f"Invalidated cache for: {message[:30]}...")
        else:
            # Clear entire cache
            self.cache.clear()
            logger.info("Entire cache cleared")
    
    @property
    def hit_rate(self) -> float:
        """Calculate cache hit rate."""
        total = self.hits + self.misses
        if total == 0:
            return 0.0
        return self.hits / total
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{self.hit_rate:.1%}",
            "ttl": self.ttl
        }
    
    def should_cache(self, message: str, response: Dict[str, Any]) -> bool:
        """
        Determine if a response should be cached.
        
        Args:
            message: User message
            response: Generated response
            
        Returns:
            True if should cache, False otherwise
        """
        # Cache criteria
        message_lower = message.lower().strip()
        
        # Always cache greetings
        greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
        if any(greeting in message_lower for greeting in greetings) and len(message.split()) <= 3:
            return True
        
        # Cache common questions
        common_questions = [
            'what can you do', 'who are you', 'how are you',
            'tell me a joke', 'say a joke', 'what is your name',
            'help', 'thank you', 'thanks', 'bye', 'goodbye'
        ]
        if any(q in message_lower for q in common_questions):
            return True
        
        # Cache short factual queries (likely to repeat)
        if len(message.split()) <= 10 and any(word in message_lower for word in ['what', 'who', 'when', 'where', 'why', 'how']):
            return True
        
        # Don't cache very long messages (likely unique)
        if len(message.split()) > 30:
            return False
        
        # Don't cache personal/contextual messages
        personal_words = ['my', 'me', 'i', 'yesterday', 'today', 'tomorrow']
        if any(word in message_lower.split() for word in personal_words):
            return False
        
        # Cache by default for short messages
        return len(message.split()) <= 15


# Global instance
response_cache = ResponseCache(max_size=100, ttl=3600)
