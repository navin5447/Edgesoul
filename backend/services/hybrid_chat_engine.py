"""
Enhanced Hybrid Chat Engine - EdgeSoul v3.0
Now uses Intelligent Reply Engine for advanced emotion detection and response routing.
"""

from typing import Optional, Dict, Any
from loguru import logger
from datetime import datetime
import re

from services.intelligent_reply_engine import intelligent_reply_engine
from models.chat import EmotionData


class HybridChatEngine:
    """
    Advanced chat engine that combines:
    1. Emotion Detection - Understands user's emotional state
    2. Knowledge Reasoning - Gets factual information
    3. Emotional Rephrasing - Adjusts tone to match emotion
    """
    
    def __init__(self):
        logger.info("Hybrid Chat Engine v3.0 initialized - using Intelligent Reply Engine")
    
    async def process_message(
        self,
        user_input: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
        user_id: str = "default"
    ) -> Dict[str, Any]:
        """
        Process user message using the new Intelligent Reply Engine.
        
        Args:
            user_input: User's message
            context: Optional conversation context
            temperature: Response creativity (0.0-1.0)
            user_id: User identifier for personalization
            
        Returns:
            Enhanced response with advanced emotion analysis and intelligent routing
        """
        start_time = datetime.now()
        
        # Input validation
        if not user_input or not isinstance(user_input, str):
            logger.warning("Invalid input received in hybrid chat engine")
            return self._error_response("Invalid input")
        
        user_input = user_input.strip()
        if len(user_input) == 0:
            return {
                "response": "I'm here! What's on your mind? 😊",
                "emotion": {"primary": "neutral", "confidence": 1.0, "all_emotions": {"neutral": 1.0}},
                "response_type": "casual_chat",
                "tone": "friendly",
                "metadata": {
                    "processing_time": "0.00s",
                    "model": "fallback"
                }
            }
        
        try:
            # Use the new intelligent reply engine
            response = await intelligent_reply_engine.generate_reply(
                message=user_input,
                user_id=user_id,
                context=context
            )
            
            # Transform to match expected format
            result = {
                "response": response['message'],
                "emotion": response['emotion'],
                "response_type": response['strategy'],
                "tone": response['emotion']['primary'],
                "metadata": {
                    "processing_time": f"{response['metadata']['processing_time']:.2f}s",
                    "knowledge_used": response['strategy'] in ['knowledge_focused', 'hybrid'],
                    "model": response['metadata']['model_used'],
                    "timestamp": response['metadata']['timestamp'],
                    "reasoning": response['metadata']['reasoning'],
                    "context": response['context'],
                    "is_emotional": response['is_emotional']
                }
            }
            
            logger.info(f"Generated {result['response_type']} response in {response['metadata']['processing_time']:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return self._error_response(str(e))
    
    async def _detect_emotion(self, text: str) -> Dict[str, Any]:
        """Detect emotion from user input with improved filtering."""
        try:
            text_lower = text.lower().strip()
            
            # Handle common greetings - always neutral
            greetings = [
                "hi", "hello", "hey", "hiya", "howdy", "greetings",
                "good morning", "good afternoon", "good evening",
                "what's up", "how are you", "how's it going"
            ]
            
            if any(greeting in text_lower for greeting in greetings) and len(text.split()) <= 5:
                return {
                    "primary": "neutral",
                    "confidence": 0.9,
                    "all": {"neutral": 0.9}
                }
            
            # Get emotion from model
            emotion_data = await self.emotion_service.detect_emotion(text)
            primary_emotion = emotion_data["primary"]
            confidence = emotion_data["confidence"]
            
            # Filter out low confidence emotions (< 0.3)
            if confidence < 0.3:
                return {
                    "primary": "neutral",
                    "confidence": 0.6,
                    "all": {"neutral": 0.6}
                }
            
            # Check if emotion makes sense for the text length/content
            word_count = len(text.split())
            if word_count > 20 and primary_emotion in ["joy", "sadness", "anger", "fear"]:
                # Long texts with strong emotions need higher confidence
                if confidence < 0.5:
                    return {
                        "primary": "neutral",
                        "confidence": 0.7,
                        "all": {"neutral": 0.7}
                    }
            
            return {
                "primary": primary_emotion,
                "confidence": confidence,
                "all": emotion_data.get("all", {})
            }
            
        except Exception as e:
            logger.error(f"Emotion detection failed: {str(e)}")
            return {
                "primary": "neutral",
                "confidence": 0.5,
                "all": {"neutral": 0.5}
            }
    
    def _is_knowledge_query(self, text: str) -> bool:
        """Determine if message is a knowledge query with improved detection."""
        text_lower = text.lower().strip()
        
        # Practical/knowledge domains
        knowledge_domains = [
            # Questions
            "what", "who", "when", "where", "why", "how",
            "explain", "tell me", "define", "describe",
            "what is", "who is", "how to", "can you explain",
            
            # Technical
            "code", "program", "write", "create", "develop",
            "calculate", "solve", "compute", "algorithm",
            "meaning", "definition", "example", "tutorial",
            
            # Banking/Finance
            "bank", "account", "upi", "pin", "payment", "transfer",
            "card", "loan", "credit", "debit", "transaction",
            "balance", "withdraw", "deposit", "atm", "netbanking",
            
            # Practical tasks
            "steps", "process", "procedure", "method", "way to",
            "instructions", "guide", "help with", "assistance",
            "problem", "issue", "trouble", "fix", "solve",
            
            # Professional
            "work", "job", "career", "study", "exam", "test",
            "learning", "skill", "course", "training",
            
            # Health/Practical
            "health", "medical", "doctor", "medicine", "diet",
            "exercise", "cooking", "recipe", "travel", "book"
        ]
        
        # Action words that indicate need for practical help
        action_keywords = [
            "change", "update", "reset", "setup", "configure",
            "install", "download", "register", "apply", "submit",
            "want to", "need to", "trying to", "looking for"
        ]
        
        # Check for question marks (strong indicator)
        has_question = "?" in text
        
        # Check for knowledge/domain keywords
        has_knowledge_keyword = any(keyword in text_lower for keyword in knowledge_domains)
        
        # Check for action keywords
        has_action_keyword = any(keyword in text_lower for keyword in action_keywords)
        
        # Greetings are not knowledge queries
        greetings = ["hi", "hello", "hey", "good morning", "good afternoon"]
        if any(greeting in text_lower for greeting in greetings) and len(text.split()) <= 3:
            return False
        
        # Pure emotional expressions (short)
        if len(text.split()) <= 5 and not (has_question or has_knowledge_keyword or has_action_keyword):
            emotional_phrases = [
                "i'm", "i am", "feeling", "feel", "so", "very",
                "happy", "sad", "angry", "scared", "love", "hate",
                "excited", "tired", "stressed", "worried"
            ]
            if any(phrase in text_lower for phrase in emotional_phrases):
                return False
        
        # If it's longer than 8 words and contains practical terms, likely knowledge
        if len(text.split()) > 8 and (has_knowledge_keyword or has_action_keyword):
            return True
        
        return has_question or has_knowledge_keyword or has_action_keyword
    
    async def _generate_hybrid_response(
        self,
        query: str,
        emotion_result: Dict[str, Any],
        context: Optional[str],
        temperature: float
    ) -> Dict[str, Any]:
        """
        Generate response combining factual knowledge with emotional awareness.
        Prioritizes practical help while maintaining emotional sensitivity.
        """
        primary_emotion = emotion_result["primary"]
        confidence = emotion_result["confidence"]
        
        # Get factual answer from knowledge engine
        logger.info(f"Fetching knowledge answer (emotion: {primary_emotion}, confidence: {confidence:.1%})")
        
        # Build context-aware prompt for better responses
        emotional_context = ""
        if confidence > 0.4:
            emotional_context = f"The user seems to be feeling {primary_emotion}. "
            if primary_emotion == "anger":
                emotional_context += "Please be calm and helpful. "
            elif primary_emotion == "sadness":
                emotional_context += "Please be supportive and gentle. "
            elif primary_emotion == "fear":
                emotional_context += "Please be reassuring and clear. "
        
        enhanced_query = f"{emotional_context}User question: {query}"
        
        # This method is deprecated - using intelligent_reply_engine instead
        return {"text": "Method deprecated", "model": "deprecated"}
        
        factual_answer = knowledge_response.response
        
        # Apply minimal emotional tuning - prioritize accuracy
        if confidence > 0.7 and len(factual_answer) > 50:
            logger.info(f"Applying subtle {primary_emotion} tone (confidence: {confidence:.1%})")
            emotionally_tuned = self._apply_subtle_emotion(
                factual_answer,
                primary_emotion,
                confidence
            )
        else:
            # For low confidence or short answers, keep original
            emotionally_tuned = factual_answer
        
        return {
            "text": emotionally_tuned,
            "tone": primary_emotion,
            "model": knowledge_response.model_name,
            "factual_base": factual_answer
        }
    
    def _apply_subtle_emotion(
        self,
        factual_text: str,
        emotion: str,
        confidence: float
    ) -> str:
        """
        Apply subtle emotional tone to factual response.
        Maintains 100% accuracy while adding minimal emotional awareness.
        """
        # Subtle emotional tone adjustments - minimal but meaningful
        tone_adjustments = {
            "anger": {
                "opening": "I understand this is frustrating. ",
                "closing": " Let me know if you need any clarification."
            },
            "sadness": {
                "opening": "I'm here to help you through this. ",
                "closing": " I hope this information is useful to you."
            },
            "fear": {
                "opening": "Let me help clarify this for you. ",
                "closing": " I hope this gives you the confidence you need."
            },
            "joy": {
                "opening": "",
                "closing": " Hope this helps! 😊"
            },
            "surprise": {
                "opening": "",
                "closing": ""
            },
            "love": {
                "opening": "",
                "closing": " Happy to help!"
            },
            "neutral": {
                "opening": "",
                "closing": ""
            }
        }
        
        # Apply subtle tone adjustment only for high confidence emotions
        if confidence < 0.8:
            return factual_text
        
        # Get tone adjustment for this emotion
        adjustment = tone_adjustments.get(emotion.lower(), {"opening": "", "closing": ""})
        
        # Apply minimal emotional context
        opening = adjustment["opening"]
        closing = adjustment["closing"]
        
        # Combine with factual content - keep it natural
        if opening and not factual_text.lower().startswith(opening.lower()):
            result = f"{opening}{factual_text}{closing}".strip()
        else:
            result = f"{factual_text}{closing}".strip()
        
        return result
    
    def _generate_emotional_response(
        self,
        text: str,
        emotion_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate purely emotional support response.
        Used when input is emotional expression, not knowledge query.
        """
        primary_emotion = emotion_result["primary"]
        confidence = emotion_result["confidence"]
        
        # Emotion-specific empathetic responses
        emotional_responses = {
            "joy": [
                "That's wonderful! I'm so happy to hear you're feeling great! Your positive energy is contagious! 😊✨",
                "I love seeing your joy! Keep shining and spreading that happiness! 🌟",
                "Your happiness makes me smile! It's beautiful to see you so uplifted! 💫",
                "That's amazing! Your joy is truly inspiring! Keep that positive spirit alive! 🎉"
            ],
            "sadness": [
                "I'm truly sorry you're feeling this way. Please know that I'm here to listen and support you. 💙",
                "It's okay to feel sad. These emotions are valid. Would you like to talk about what's on your mind?",
                "I understand you're going through a difficult time. Remember, this feeling is temporary, and I'm here with you.",
                "I can sense your pain. You're not alone in this. Would sharing more help ease the burden?"
            ],
            "anger": [
                "I can sense your frustration, and that's completely valid. Let's work through this together.",
                "I understand you're upset. Take a deep breath. I'm here to listen without judgment.",
                "Your feelings are heard. Sometimes it helps to express what's bothering you. I'm listening.",
                "I recognize your anger. It's okay to feel this way. Want to talk about what triggered these feelings?"
            ],
            "fear": [
                "I understand you're feeling worried or anxious. You're safe here, and I'm here to help ease your concerns. 💪",
                "It's completely normal to feel scared sometimes. Let's address your concerns together, one step at a time.",
                "I can sense your unease. Remember, you're stronger than you think. How can I help you feel more secure?",
                "Fear is a natural response. I'm here to provide support and help you work through these feelings."
            ],
            "surprise": [
                "Wow, that sounds unexpected! Tell me more about what surprised you! 🤔",
                "That must have been quite a surprise! How are you processing this?",
                "Interesting! Life can be full of surprises. How do you feel about this development?",
                "That's quite remarkable! Surprises can be exciting or unsettling. What's your take on it?"
            ],
            "love": [
                "That's beautiful! Love is such a wonderful feeling to experience. 💕",
                "I can feel the warmth and affection in your words. That's truly special! ❤️",
                "How lovely! It's heartwarming to hear you express such positive feelings! 💖",
                "That's wonderful! Love and connection are what make life meaningful. 🌹"
            ],
            "neutral": [
                "Hello! I'm EdgeSoul, your AI companion. How can I help you today?",
                "Hi there! I'm here to assist you with any questions or just have a friendly chat. What's on your mind?",
                "Hey! Great to meet you. I'm ready to help with anything you need - from practical questions to just listening.",
                "Hello! I'm EdgeSoul. Whether you need information, advice, or just want to chat, I'm here for you!"
            ]
        }
        
        # Get appropriate response
        import random
        responses = emotional_responses.get(
            primary_emotion,
            ["I hear you. How can I help you today?"]
        )
        
        response_text = random.choice(responses)
        
        return {
            "text": response_text,
            "tone": primary_emotion,
            "model": "emotional_support"
        }
    
    def _error_response(self, error_msg: str) -> Dict[str, Any]:
        """Generate error response."""
        return {
            "response": "I apologize, but I'm having some technical difficulties right now. Please try again in a moment, or let me know if there's anything else I can help you with.",
            "emotion": {
                "primary": "neutral",
                "confidence": 0.5,
                "all_emotions": {"neutral": 0.5}
            },
            "response_type": "error",
            "tone": "neutral",
            "metadata": {
                "processing_time": "0.01s",
                "knowledge_used": False,
                "model": "fallback",
                "timestamp": datetime.now().isoformat(),
                "error": error_msg
            }
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get engine statistics and status."""
        return {
            "engine_type": "hybrid_v3",
            "uses_intelligent_reply_engine": True,
            "capabilities": [
                "advanced_emotion_detection",
                "context_awareness",
                "intelligent_response_routing",
                "emotional_support",
                "knowledge_queries",
                "hybrid_responses",
                "personality_adaptation"
            ]
        }


# Global instance
hybrid_chat_engine = HybridChatEngine()
