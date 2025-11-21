from typing import Optional, Dict
from loguru import logger
import uuid
from datetime import datetime

from services.emotion_service import emotion_service
from services.knowledge_service import knowledge_service
from services.hybrid_chat_engine import hybrid_chat_engine
from models.chat import ChatResponse, EmotionData
from core.config import settings


class ChatService:
    """Service for handling chat interactions."""
    
    def __init__(self):
        self.sessions: Dict[str, dict] = {}
    
    async def process_message(
        self,
        message: str,
        session_id: Optional[str] = None,
        context: Optional[str] = None,
        use_hybrid: bool = True,  # Enable hybrid engine by default
    ) -> ChatResponse:
        """
        Process a chat message with enhanced intelligence and error handling.
        Ensures chatbot never crashes and always provides appropriate responses.
        """
        # Input validation and sanitization
        if not message or not isinstance(message, str):
            logger.warning("Invalid message input received")
            return ChatResponse(
                content="I didn't quite catch that. Could you please say that again?",
                emotion=EmotionData(
                    primary="neutral",
                    confidence=1.0,
                    all_emotions={"neutral": 1.0}
                ),
                response_type="error_recovery",
                session_id=session_id or str(uuid.uuid4())
            )
        
        # Trim and sanitize message
        message = message.strip()
        if len(message) == 0:
            return ChatResponse(
                content="I'm here and listening! What would you like to talk about? 😊",
                emotion=EmotionData(
                    primary="neutral",
                    confidence=1.0,
                    all_emotions={"neutral": 1.0}
                ),
                response_type="prompt",
                session_id=session_id or str(uuid.uuid4())
            )
        
        # Limit message length to prevent processing errors
        if len(message) > 5000:
            message = message[:5000]
            logger.warning("Message truncated to 5000 characters")
        
        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Initialize session if new
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "messages": [],
                "created_at": datetime.now(),
            }
        
        try:
            logger.info(f"Processing message: {message[:50]}...")
            
            # Use Hybrid Chat Engine if enabled
            if use_hybrid:
                try:
                    # Build context from session history
                    session_context = self._build_context(session_id)
                    full_context = f"{session_context}\n{context}" if context else session_context
                    
                    # Process with hybrid engine
                    hybrid_result = await hybrid_chat_engine.process_message(
                        user_input=message,
                        context=full_context,
                        temperature=0.7
                    )
                    
                    # Store message in session
                    self.sessions[session_id]["messages"].append({
                        "role": "user",
                        "content": message,
                        "timestamp": datetime.now(),
                        "emotion": hybrid_result["emotion"],
                    })
                    
                    self.sessions[session_id]["messages"].append({
                        "role": "assistant",
                        "content": hybrid_result["response"],
                        "timestamp": datetime.now(),
                        "metadata": hybrid_result["metadata"]
                    })
                    
                    # Build response
                    emotion_data = EmotionData(
                        primary=hybrid_result["emotion"]["primary"],
                        confidence=hybrid_result["emotion"]["confidence"],
                        all=hybrid_result["emotion"]["all_emotions"]
                    )
                    
                    return ChatResponse(
                        message=hybrid_result["response"],
                        emotion=emotion_data,
                        knowledge_context=full_context if hybrid_result["metadata"]["knowledge_used"] else None,
                        session_id=session_id,
                        timestamp=datetime.now(),
                    )
                    
                except Exception as e:
                    logger.error(f"Hybrid engine failed, falling back to legacy mode: {str(e)}")
                    # Fall through to legacy processing
            
            # Detect emotion if enabled
            emotion_data = None
            if settings.ENABLE_EMOTION_DETECTION:
                try:
                    emotion_result = await emotion_service.detect_emotion(message)
                    emotion_data = EmotionData(
                        primary=emotion_result["primary"],
                        confidence=emotion_result["confidence"],
                        all=emotion_result.get("all"),
                    )
                    logger.info(f"Detected emotion: {emotion_result['primary']} ({emotion_result['confidence']:.2%})")
                except Exception as e:
                    logger.warning(f"Emotion detection failed: {str(e)}")
            
            # Generate response using knowledge reasoning or emotion-aware response
            knowledge_response = ""
            knowledge_context = None
            
            # Decide whether to use knowledge reasoning or emotion-aware response
            use_knowledge = self._should_use_knowledge(message, emotion_data)
            
            if settings.ENABLE_KNOWLEDGE_REASONING and use_knowledge:
                try:
                    logger.info("Using knowledge-based response for factual query")
                    # Build context from session history
                    session_context = self._build_context(session_id)
                    full_context = f"{session_context}\n{context}" if context else session_context
                    
                    knowledge_result = await knowledge_service.generate_response(
                        query=message,
                        context=full_context,
                        emotion=emotion_data.primary if emotion_data else None,
                    )
                    
                    knowledge_response = knowledge_result.response
                    knowledge_context = knowledge_result.context_used
                except Exception as e:
                    logger.error(f"Knowledge reasoning failed: {str(e)}")
                    # Fallback to emotion-aware response
                    knowledge_response = self._generate_emotion_aware_response(message, emotion_data)
            else:
                logger.info("Using emotion-aware response")
                # Generate simple emotion-aware response
                knowledge_response = self._generate_emotion_aware_response(message, emotion_data)
            
            # Store message in session
            self.sessions[session_id]["messages"].append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now(),
                "emotion": emotion_data.dict() if emotion_data else None,
            })
            
            self.sessions[session_id]["messages"].append({
                "role": "assistant",
                "content": knowledge_response,
                "timestamp": datetime.now(),
            })
            
            return ChatResponse(
                message=knowledge_response,
                emotion=emotion_data,
                knowledge_context=knowledge_context,
                session_id=session_id,
                timestamp=datetime.now(),
            )
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return ChatResponse(
                content="I apologize, but I encountered an error processing your message. Please try again.",
                emotion=EmotionData(
                    primary="neutral",
                    confidence=1.0,
                    all_emotions={"neutral": 1.0}
                ),
                response_type="error",
                session_id=session_id
            )
    
    def _should_use_knowledge(self, message: str, emotion_data: Optional[EmotionData]) -> bool:
        """
        Determine if the message requires knowledge-based reasoning.
        Returns True for factual queries, False for emotional expressions.
        """
        message_lower = message.lower()
        
        # Keywords that indicate factual/knowledge queries
        knowledge_keywords = [
            "who", "what", "when", "where", "why", "how",
            "explain", "tell me", "define", "describe",
            "what is", "who is", "when did", "how to",
            "president", "capital", "calculate", "solve",
            "meaning", "definition", "history", "fact"
        ]
        
        # Check if message contains knowledge keywords
        has_knowledge_keyword = any(keyword in message_lower for keyword in knowledge_keywords)
        
        # Check emotion intensity - if emotion is very strong (>80%), use emotion-aware
        if emotion_data and emotion_data.confidence > 0.80:
            strong_emotions = ["sadness", "anger", "fear", "joy"]
            if emotion_data.primary in strong_emotions:
                logger.info(f"Strong emotion detected ({emotion_data.primary}: {emotion_data.confidence:.2%}), using emotion-aware response")
                return False
        
        # If has knowledge keywords, use knowledge-based response
        if has_knowledge_keyword:
            logger.info("Knowledge query detected")
            return True
        
        # Default to emotion-aware for conversational messages
        return False
    
    def _build_context(self, session_id: str, max_messages: int = 5) -> str:
        """Build context from recent session messages."""
        if session_id not in self.sessions:
            return ""
        
        messages = self.sessions[session_id]["messages"][-max_messages:]
        context_parts = []
        
        for msg in messages:
            role = msg["role"].capitalize()
            content = msg["content"]
            context_parts.append(f"{role}: {content}")
        
        return "\n".join(context_parts)
    
    def _generate_emotion_aware_response(self, message: str, emotion_data: Optional[EmotionData]) -> str:
        """Generate a contextual, action-oriented emotion-aware response."""
        if not emotion_data:
            logger.info("No emotion data, using default response")
            return "I'm here for you. What's on your mind?"
        
        emotion = emotion_data.primary.lower()
        message_lower = message.lower()
        logger.info(f"Generating response for emotion: {emotion}")
        
        # Check for specific user requests
        wants_encouragement = any(word in message_lower for word in [
            "make me", "help me feel", "cheer me up", "make me cool", 
            "make me confident", "boost", "motivate"
        ])
        
        wants_calm = any(word in message_lower for word in [
            "calm", "relax", "peace", "anxiety", "stressed", "nervous"
        ])
        
        # Action-oriented responses based on request + emotion
        if wants_encouragement:
            if emotion in ["fear", "sadness", "anger"]:
                import random
                empowering_responses = [
                    f"You ARE strong! You're facing your {emotion} head-on, and that takes real courage. Now let's channel that energy - what's one thing you're good at?",
                    f"Hey, you're already cool by being brave enough to share this. Let's flip the script - tell me something awesome about yourself!",
                    f"I see your strength even when you don't. You're handling this {emotion} like a champ. What would make you feel powerful right now?",
                    f"You've got this! Your {emotion} shows you care, and that's actually amazing. Now let's turn that into confidence - what makes you feel unstoppable?"
                ]
                return random.choice(empowering_responses)
        
        if wants_calm and emotion in ["fear", "anger"]:
            import random
            calming_responses = [
                "Take a deep breath with me - in for 4, hold for 4, out for 4. You're safe here. What's one thing you can control right now?",
                "Let's slow things down together. You're in control, even when it doesn't feel like it. What would help you feel grounded?",
                "I've got you. Focus on this moment - you're here, you're safe, and we're figuring this out together. What do you need right now?"
            ]
            return random.choice(calming_responses)
        
        # Emotion-specific responses
        responses = {
            "joy": [
                "Yes! I love seeing your energy! Keep that momentum going - what else is making you happy? 🌟",
                "That's amazing! Your positive vibes are contagious! What are you celebrating? ✨",
                "You're radiating joy and I'm here for it! Tell me more about what's got you feeling so good! 😊"
            ],
            "sadness": [
                "I hear you, and it's okay to feel this way. You're not alone - I'm right here with you. What's weighing on your heart?",
                "I'm sorry you're hurting. Your feelings are valid. Want to talk about what's making you sad? I'm listening. 💙",
                "It's tough when you feel down. Remember, you're stronger than you think. What would help you feel a little lighter?"
            ],
            "anger": [
                "I can feel your frustration, and that's completely valid. You have every right to be upset. What triggered this?",
                "Your anger is telling you something important. Let's figure out what it is. What happened?",
                "I get it - you're fired up about something. Let's work through this together. What needs to change?"
            ],
            "fear": [
                "I can sense your worry, and that takes guts to admit. You're braver than you feel right now. What's scaring you?",
                "Anxiety is tough, but you're tougher. Let's break this down together - what's the biggest worry on your mind?",
                "Fear shows you care deeply. That's actually a strength. What would help you feel more in control right now?"
            ],
            "surprise": [
                "Whoa! That's quite unexpected! How are you processing this surprise? Good or unsettling?",
                "Life just threw you a curveball! Tell me more - what happened that caught you off guard?",
                "Surprises can be intense! Take a moment - how are you feeling about all this?"
            ],
            "love": [
                "That's beautiful! Love and connection are what make life meaningful. Tell me more about what sparked this feeling! 💕",
                "Your heart is so full right now, and that's wonderful! What's making you feel so loved?",
                "I can feel the warmth in your words. Love is powerful! What's bringing you this joy? 💖"
            ],
            "neutral": [
                "I'm here and listening. What's on your mind today?",
                "Tell me more - I'm all ears. What would you like to explore?",
                "I'm with you. What's going through your head right now?"
            ]
        }
        
        # Get response for emotion (default to neutral)
        import random
        emotion_responses = responses.get(emotion, responses["neutral"])
        return random.choice(emotion_responses)
    
    def get_session(self, session_id: str) -> Optional[dict]:
        """Get session data."""
        return self.sessions.get(session_id)
    
    def clear_session(self, session_id: str):
        """Clear a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]


# Global instance
chat_service = ChatService()
