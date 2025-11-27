"""
Intelligent Reply Engine - EdgeSoul v3.0
Unified system combining emotional intelligence with knowledge-based responses.
"""

from typing import Dict, List, Optional, Any, Tuple
from loguru import logger
from datetime import datetime
import asyncio
import json
import time

from services.emotion_service import emotion_service
from services.knowledge_engine import knowledge_engine
from services.memory_service import memory_service
# DISABLED: conversation_cache was causing Ollama timeouts and errors
# from services.conversation_cache import conversation_cache
from core.config import settings  # Import settings for optimization


class IntelligentReplyEngine:
    """
    Advanced reply system that:
    1. Detects true emotions with context
    2. Routes to appropriate response strategy
    3. Combines emotional support + knowledge
    4. Maintains conversation memory
    5. Adapts personality based on user patterns
    """
    
    def __init__(self):
        self.emotion_detector = emotion_service  # Using existing emotion service for now
        self.knowledge_engine = knowledge_engine
        self.memory_service = memory_service  # Add memory service
        self.conversation_memory = {}
        self.personality_traits = {
            'supportive': 0.8,
            'informative': 0.9, 
            'humorous': 0.3,
            'formal': 0.2,
            'empathetic': 0.7
        }
    
    async def generate_reply(self, message: str, user_id: str = "default", 
                           context: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate intelligent reply combining emotion + knowledge.
        
        Flow:
        1. Check for cached conversation context (faster continuing conversations)
        2. Detect emotion with advanced classifier
        3. Determine response strategy
        4. Generate appropriate reply
        5. Add memory and personality
        6. Update conversation context cache
        """
        
        start_time = datetime.now()
        
        try:
            # DISABLED: Conversation cache was causing errors and Ollama timeouts
            # cached_context = conversation_cache.get_context(user_id)
            # use_cached_context = cached_context is not None and not conversation_cache.should_refresh(user_id)
            use_cached_context = False
            
            # if use_cached_context:
            #     logger.debug(f"Using cached conversation context for {user_id}")
            
            # OPTIMIZATION 2: Run profile, context, and emotion detection in parallel
            if settings.ENABLE_PARALLEL_PROCESSING:
                profile_task = asyncio.create_task(
                    asyncio.to_thread(self.memory_service.get_or_create_profile, user_id)
                )
                context_task = asyncio.create_task(
                    asyncio.to_thread(self.memory_service.get_context_summary, user_id, 3)
                )
                emotion_task = asyncio.create_task(
                    self.emotion_detector.detect_emotion(message)
                )
                
                # Wait for all parallel tasks
                profile, context_summary, emotion_data = await asyncio.gather(
                    profile_task,
                    context_task,
                    emotion_task
                )
            else:
                # Sequential processing (fallback)
                profile = self.memory_service.get_or_create_profile(user_id)
                context_summary = self.memory_service.get_context_summary(user_id, max_messages=3)
                emotion_data = await self.emotion_detector.detect_emotion(message)
            
            # CRITICAL: Check for negation - user saying they're NOT feeling something
            is_negated = self._check_emotional_negation(message)
            
            # Transform to expected format
            emotion_result = {
                'primary': emotion_data.get('primary', 'neutral'),
                'confidence': emotion_data.get('confidence', 0.5),
                'intensity': emotion_data.get('confidence', 0.5) * 100,  # Convert to 0-100 scale
                'all_emotions': emotion_data.get('all', {emotion_data.get('primary', 'neutral'): emotion_data.get('confidence', 0.5)}),
                'context': self._detect_context(message),
                'is_emotional': emotion_data.get('confidence', 0.5) > 0.6,
                'reasoning': f"Detected {emotion_data.get('primary', 'neutral')} with {emotion_data.get('confidence', 0.5):.2f} confidence"
            }
            
            # If negation detected, override to neutral and mark as clarification
            if is_negated:
                emotion_result['primary'] = 'neutral'
                emotion_result['confidence'] = 0.9  # High confidence it's a clarification
                emotion_result['is_emotional'] = False
                emotion_result['context'] = 'clarification'
                emotion_result['reasoning'] = 'User is clarifying they are NOT feeling emotional - treating as neutral'
                logger.info("Detected emotional negation - treating as neutral clarification")
            
            # Step 2: Determine response strategy
            strategy = self._determine_strategy(message, emotion_result)
            
            # Step 3: Generate reply based on strategy
            if strategy == 'emotional_support':
                reply_data = await self._handle_emotional_support(message, emotion_result, user_id)
            elif strategy == 'knowledge_focused':
                reply_data = await self._handle_knowledge_request(message, emotion_result, user_id, profile)
            elif strategy == 'hybrid':
                reply_data = await self._handle_hybrid_response(message, emotion_result, user_id)
            elif strategy == 'casual_chat':
                reply_data = await self._handle_casual_chat(message, emotion_result, user_id)
            else:
                reply_data = await self._handle_default_response(message, emotion_result, user_id)
            
            # Step 4: Add personality and memory
            enhanced_reply = self._enhance_with_personality(reply_data, user_id, profile)
            
            # Step 5: Update conversation memory and learn from interaction
            self._update_memory(user_id, message, enhanced_reply, emotion_result)
            
            # Track emotion pattern
            self.memory_service.track_emotion(
                user_id=user_id,
                emotion=emotion_result['primary'],
                intensity=emotion_result['intensity'],
                context=message
            )
            
            # Update conversation context
            self.memory_service.update_conversation_context(
                user_id=user_id,
                session_id=user_id,  # Could be a proper session ID
                message=message,
                response=enhanced_reply['text'],
                emotion=emotion_result['primary']
            )
            
            # Learn preferences automatically
            learned = self.memory_service.learn_preference(user_id, message, enhanced_reply['text'])
            if learned:
                logger.info(f"Learned new preference for {user_id}: {learned.content}")
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Build final response
            final_response = {
                'text': enhanced_reply['text'],  # For compatibility
                'message': enhanced_reply['text'],  # Main field
                'type': strategy,  # For compatibility
                'strategy': strategy,
                'emotion': {
                    'primary': emotion_result['primary'],
                    'confidence': emotion_result['confidence'],
                    'intensity': emotion_result['intensity'],
                    'all_emotions': emotion_result['all_emotions']
                },
                'context': emotion_result['context'],
                'is_emotional': emotion_result['is_emotional'],
                'personality_applied': enhanced_reply.get('personality_traits', {}),
                'metadata': {
                    'processing_time': round(processing_time, 3),
                    'reasoning': emotion_result['reasoning'],
                    'model_used': enhanced_reply.get('model', 'hybrid'),
                    'timestamp': datetime.now().isoformat()
                }
            }
            
            logger.info(f"Reply generated - Strategy: {strategy}, Emotion: {emotion_result['primary']} ({emotion_result['confidence']:.2f})")
            
            # DISABLED: Cache was causing Ollama timeouts and errors
            # conversation_cache.update_context(user_id, {
            #     'last_emotion': emotion_result,
            #     'last_strategy': strategy,
            #     'profile': profile,
            #     'timestamp': time.time()
            # })
            
            return final_response
            
        except Exception as e:
            logger.error(f"Error generating reply: {e}")
            return self._error_response(str(e))
    
    def _determine_strategy(self, message: str, emotion_result: Dict) -> str:
        """Determine the best response strategy based on message analysis with enhanced intelligence."""
        
        context = emotion_result['context']
        emotion = emotion_result['primary']
        confidence = emotion_result['confidence']
        is_emotional = emotion_result['is_emotional']
        message_lower = message.lower()
        word_count = len(message.split())
        
        # Strategy decision tree - Enhanced with better intelligence
        
        # 0. PRIORITY: Clarification/Negation - user saying they're NOT emotional
        if context == 'clarification':
            logger.info("User is clarifying, not expressing emotion - using casual_chat")
            return 'casual_chat'
        
        # 0.5. PRIORITY: Emotional Learning - user expressing positive emotion + wants to learn
        if context == 'emotional_learning':
            logger.info("Emotional learning request detected - using hybrid mode")
            return 'hybrid'
        
        # 1. Gratitude expressions
        if context == 'gratitude':
            return 'casual_chat'
        
        # 2. Greetings and casual (short messages only)
        if context == 'greeting' and word_count <= 5:
            return 'casual_chat'
        
        # 2.5 PRIORITY: Casual conversation BEFORE knowledge detection
        if context == 'casual_conversation':
            logger.info("Casual conversation detected - using casual_chat")
            return 'casual_chat'
        
        # 3. ENHANCED: Specific requests that should use knowledge engine
        # IMPORTANT: Check if message is a CLEAR question, not just contains question words
        
        # CRITICAL: Check for emotional context FIRST before routing to knowledge
        # If user expresses emotion + wants to learn, use HYBRID (emotion-aware knowledge)
        emotional_learning_patterns = [
            'happy mode', 'excited to', 'joyful', 'feeling good', 'in this mood',
            'sad but want', 'angry but need', 'scared but want to'
        ]
        
        has_emotional_context = any(pattern in message_lower for pattern in emotional_learning_patterns)
        
        # If emotional context + learning request, use HYBRID not pure knowledge
        if has_emotional_context and is_emotional:
            logger.info(f"Emotional learning request detected - using hybrid mode")
            return 'hybrid'
        
        # Pure knowledge requests (no emotional context)
        knowledge_requests = [
            'tell me a joke', 'tell me about', 'can you explain', 'can you say',
            'show me', 'help me with', 'teach me', 'can you define', 'can you tell',
            'calculate', 'solve', 'write code', 'create program', 'build', 'develop',
            'steps to', 'how do i', 'how can i', 'give me', 'list', 'compare',
            'difference between', 'meaning of', 'example of', 'tutorial on',
            'write a', 'make a', 'generate', 'show me how'
        ]
        
        # CRITICAL: For "what is", "who is", "where is" - check if it's STARTING the sentence (actual question)
        # Don't trigger on "what is the reason" in middle of emotional statement
        starts_with_question = message_lower.startswith(('what is', 'who is', 'where is', 'when is', 
                                                          'why is', 'how is', 'what are', 'who are',
                                                          'where are', 'when are', 'why are', 'how are'))
        
        # Check for explicit knowledge requests OR clear questions at start
        # BUT: If emotion is joy/excitement and they want to learn, acknowledge their emotion!
        if any(req in message_lower for req in knowledge_requests) or starts_with_question:
            # If user is happy/excited about learning, acknowledge it!
            if emotion == 'joy' and any(word in message_lower for word in ['learn', 'want to', 'excited', 'happy']):
                logger.info(f"Joyful learning request - using hybrid to acknowledge emotion")
                return 'hybrid'
            return 'knowledge_focused'
        
        # 4. IMPROVED: Detect emotional distress from context, not just confidence
        # Strong emotional keywords that indicate need for support (typo-tolerant)
        emotional_keywords = [
            'depress', 'hurt', 'scared', 'worried', 'anxious', 'crying',
            'devastated', 'horrible', 'terrible', 'awful', 'lonely', 'alone',
            'hopeless', 'helpless', 'worthless', 'furious', 'frustrated',
            'unfair', 'wrongly', 'blamed', 'scolded', 'punished', 'innocent',
            'not my fault', 'didn\'t do', 'no one', 'nobody', 'isolated'
        ]
        
        # If message contains emotional distress keywords AND detected emotion is negative
        # BUT NOT if it's a clarification/negation
        if (emotion in ['sadness', 'fear', 'anger'] and 
            any(kw in message_lower for kw in emotional_keywords) and
            context != 'clarification'):
            return 'emotional_support'
        
        # High confidence emotional detection (but not for clarifications)
        if (is_emotional and confidence > 0.5 and 
            emotion in ['sadness', 'fear', 'anger'] and
            context != 'clarification'):
            return 'emotional_support'
        
        # 5. Clear knowledge/practical requests - PRIORITY over emotion detection
        # If user asking practical question (job, form, etc.), use knowledge NOT emotional support
        if context in ['practical_request', 'question']:
            # Even if emotion detected, practical questions should get factual answers
            logger.info(f"Practical request detected (context={context}) - using knowledge_focused")
            return 'knowledge_focused'
        
        # 6. Casual conversation (greetings, "how are you", "what's up") - use casual chat
        if context in ['greeting', 'casual_conversation']:
            logger.info(f"Casual conversation detected - using casual_chat")
            return 'casual_chat'
        
        # 7. Positive emotions with questions - use knowledge engine
        if emotion in ['joy', 'surprise', 'neutral'] and context == 'question':
            return 'knowledge_focused'
        
        # 8. Mixed emotional + informational
        if is_emotional and context in ['question', 'practical_request'] and emotion in ['anger', 'fear']:
            return 'hybrid'
        
        # 9. General conversation
        return 'casual_chat'
    
    async def _handle_emotional_support(self, message: str, emotion_result: Dict, user_id: str) -> Dict:
        """Handle messages requiring emotional support using AI with personality adaptation."""
        
        emotion = emotion_result['primary']
        intensity = emotion_result['intensity']
        
        # BOOST intensity based on emotional keywords and context
        message_lower = message.lower()
        
        # High intensity indicators (typo-tolerant)
        high_intensity_words = [
            'very', 'extremely', 'really', 'so', 'deeply', 'terribly', 'completely',
            'depress', 'devastated', 'horrible', 'terrible', 'awful', 'worst',
            'unbearable', 'can\'t take', 'breaking down', 'crying', 'tears'
        ]
        
        # Context that indicates high emotional distress
        distress_contexts = [
            'no one understands', 'nobody cares', 'all alone', 'want to give up',
            'can\'t do this', 'too much', 'unfair', 'wrongly', 'blamed for',
            'not my fault', 'innocent', 'didn\'t do', 'scolded', 'punished'
        ]
        
        # Count emotional intensifiers
        intensifier_count = sum(1 for word in high_intensity_words if word in message_lower)
        distress_count = sum(1 for phrase in distress_contexts if phrase in message_lower)
        
        # Boost intensity if strong emotional language detected
        if intensifier_count >= 2 or distress_count >= 1:
            intensity = max(intensity, 75)  # Force high intensity
            logger.info(f"Boosted emotion intensity to {intensity} based on context")
        elif intensifier_count == 1 or len(message.split()) > 15:
            intensity = max(intensity, 50)  # Force medium intensity
        
        # Determine intensity level
        if intensity > 75:
            intensity_level = 'high'
        elif intensity > 40:
            intensity_level = 'medium' 
        else:
            intensity_level = 'low'
        
        # Try to get user profile for personality adaptation
        profile = None
        try:
            profile = self.memory_service.get_or_create_profile(user_id)
        except Exception as e:
            logger.debug(f"Could not load profile for emotional support: {e}")
        
        # Generate AI-powered emotional support response
        try:
            # Initialize knowledge engine if needed (we use it for emotional AI too)
            if not self.knowledge_engine.is_ready():
                await self.knowledge_engine.initialize()
            
            # Build SHORT, emotionally-focused prompt (faster response)
            intensity_guide = {
                'high': 'very distressed',
                'medium': 'struggling',
                'low': 'bothered'
            }
            
            # Get gender personality for emotional tone
            gender_personality = self._get_gender_personality(profile) if profile else None
            
            # Adjust empathy depth based on user profile AND gender
            response_length = "2-3 sentences"
            empathy_style = "supportive"
            
            if profile and hasattr(profile, 'empathy_level'):
                if profile.empathy_level < 30:
                    response_length = "1 sentence"
                    empathy_style = "brief"
                elif profile.empathy_level > 70:
                    response_length = "3-4 sentences"
                    empathy_style = "very supportive"
                logger.debug(f"Using empathy level {profile.empathy_level} for emotional support")
            
            # Get conversation context for continuity
            conv_context = self.memory_service.get_conversation_context(user_id)
            context_text = None
            if conv_context and conv_context.messages:
                # Get last 2 exchanges for context
                recent = conv_context.messages[-2:] if len(conv_context.messages) >= 2 else conv_context.messages
                context_parts = []
                for msg in recent:
                    if 'user' in msg:
                        context_parts.append(f"User: {msg['user'][:80]}")
                    if 'assistant' in msg:
                        context_parts.append(f"Bot: {msg['assistant'][:80]}")
                if context_parts:
                    context_text = "\n".join(context_parts)
            
            # Simple prompt - just the message
            prompt = message
            
            # Adjust length based on empathy level AND gender
            empathy = getattr(profile, 'empathy_level', 50) if profile else 50
            if empathy < 30:
                max_words = 20  # Brief support
            elif empathy > 70:
                max_words = 60  # More caring
            else:
                max_words = 40  # Balanced
            
            # Apply gender-based modifications
            if gender_personality:
                max_words = gender_personality['max_words_emotional']
                empathy_style = gender_personality['emotional_tone']
                logger.debug(f"Using gender-based emotional style: {empathy_style}, length: {max_words}")
            
            # Get AI response with conversation context
            knowledge_response = await self.knowledge_engine.ask(
                question=prompt,
                context=context_text,  # Pass conversation history
                emotion=emotion,
                temperature=0.7,
                max_tokens=max_words
            )
            
            ai_response = knowledge_response.response
            
            logger.info(f"Generated emotional support for {emotion} ({intensity_level})")
            
            return {
                'text': ai_response,
                'type': 'emotional_support',
                'model': 'ollama_empathetic',
                'emotion_addressed': emotion,
                'intensity_level': intensity_level
            }
            
        except Exception as e:
            logger.error(f"AI emotional support failed: {e}, using fallback templates")
            # Fallback to template-based responses
            return await self._fallback_emotional_support(emotion, intensity_level)
    
    async def _fallback_emotional_support(self, emotion: str, intensity_level: str) -> Dict:
        """Fallback template-based emotional support when AI fails."""
        import random
        
        fallback_templates = {
            'sadness': {
                'high': [
                    "I can see you're really struggling right now. Your feelings are completely valid, and it's okay to feel this way. You're stronger than you think, and I'm here to support you through this. What would help you feel better right now?",
                    "I hear you, and I want you to know that you're not alone in this. This is a difficult moment, but it doesn't define you. You have the strength to get through this, and I believe in you. Want to talk about what's going on?"
                ],
                'medium': [
                    "I can tell something's bothering you, and I'm here to listen. It's okay to feel down sometimes - it's part of being human. Let's work through this together. What's on your mind?",
                    "You seem like you're going through a tough time. Remember that difficult moments help us grow. I'm here to support you. How can I help?"
                ],
                'low': [
                    "Something seems to be on your mind. I'm here if you want to talk about it. What's going on?",
                    "I'm sensing you might be feeling a bit off. Want to share what's bothering you?"
                ]
            },
            'anger': {
                'high': [
                    "I can feel your frustration, and it's completely understandable to feel this way. Let's take a moment together and think about how to handle this situation constructively. What happened?",
                    "You're clearly upset, and that's okay. Your feelings matter. Let's talk through this and figure out the best way forward. I'm here to help."
                ],
                'medium': [
                    "I can see you're frustrated. It's okay to feel annoyed sometimes. Let's work through this together. What's bothering you?",
                    "Sounds like something really got to you. I'm here to listen and help you process this. What's going on?"
                ],
                'low': [
                    "Something seems to have irritated you. Want to talk about it?",
                    "I'm picking up on some frustration. How can I help?"
                ]
            },
            'fear': {
                'high': [
                    "I can sense you're feeling really anxious right now. It's okay to be scared - it means you care. You're braver than you think, and I'm here with you. Let's break this down together. What's worrying you?",
                    "I hear the worry in your words. Fear is natural, but you don't have to face it alone. You've got this, and I'm here to support you. Want to talk through what's making you anxious?"
                ],
                'medium': [
                    "It sounds like something's making you a bit anxious. That's completely normal. Let's work through this worry together. What's on your mind?",
                    "I can sense some concern here. It's okay to feel uncertain sometimes. I'm here to help you feel more confident. What's bothering you?"
                ],
                'low': [
                    "Something seems to be causing a bit of worry. Want to talk it through?",
                    "I'm sensing some mild concern. How can I help ease your mind?"
                ]
            }
        }
        
        responses = fallback_templates.get(emotion, {}).get(intensity_level, [
            "I'm here for you. Your feelings matter, and I want to understand what you're going through.",
            "I hear you, and I'm here to support you. Want to talk more about what's on your mind?"
        ])
        
        response_text = random.choice(responses)
        
        return {
            'text': response_text,
            'type': 'emotional_support',
            'model': 'template_fallback',
            'emotion_addressed': emotion,
            'intensity_level': intensity_level
        }
    
    async def _handle_knowledge_request(self, message: str, emotion_result: Dict, user_id: str, profile=None) -> Dict:
        """Handle knowledge-focused requests using Ollama AI with conversation context for incomplete questions."""
        
        try:
            # Initialize knowledge engine if not ready
            if not self.knowledge_engine.is_ready():
                await self.knowledge_engine.initialize()
            
            emotion = emotion_result['primary']
            message_lower = message.lower()
            
            # Check if question is incomplete (needs conversation context)
            incomplete_patterns = ['give what', 'what to', 'include what', 'need what', 'which one', 'say what', 'how about']
            is_incomplete = any(pattern in message_lower for pattern in incomplete_patterns)
            
            # Smart context handling - get conversation context from memory
            enhanced_message = message
            try:
                conversation_context = await self.memory_service.get_conversation_context(user_id)
                if conversation_context and len(conversation_context) > 0:
                    # Extract last 2-3 exchanges for context
                    recent_context = self._extract_relevant_context(conversation_context, message)
                    if recent_context:
                        enhanced_message = f"Previous context: {recent_context}\n\nCurrent question: {message}"
            except Exception as ctx_error:
                logger.debug(f"Could not retrieve conversation context: {ctx_error}")
            
            # Detect practical application/career questions that need structured answers
            practical_structured_keywords = [
                'application', 'resume', 'cv', 'interview', 'job', 'career',
                'why did you choose', 'why choose', 'form', 'fill', 'include on',
                'what to write', 'how to answer', 'what should i say'
            ]
            needs_structured_answer = any(kw in message_lower for kw in practical_structured_keywords)
            
            # Detect coding/programming questions that need complete code
            coding_keywords = [
                'code', 'program', 'python', 'javascript', 'java', 'function',
                'write a', 'create a', 'make a', 'build a', 'fibonacci', 'algorithm',
                'script', 'class', 'method', 'loop', 'array', 'list'
            ]
            is_coding_question = any(kw in message_lower for kw in coding_keywords)
            
            # Adjust temperature and style based on request type
            if any(word in message_lower for word in ['joke', 'funny', 'humor']):
                temperature = 0.8
                max_tokens = 300
            elif is_coding_question:
                # Code questions need more tokens for complete programs
                temperature = 0.3
                max_tokens = 2000  # Enough for full code with comments and explanations
            elif needs_structured_answer:
                temperature = 0.3
                max_tokens = 800  # Increased for complete explanations
            else:
                temperature = 0.2  # Factual, concise
                max_tokens = 600  # Increased to avoid cutting off mid-sentence
            
            # Simple prompt - just the question
            query_for_ai = enhanced_message
            
            # Get knowledge response from Ollama
            knowledge_response = await self.knowledge_engine.ask(
                question=query_for_ai,
                context=None,
                emotion=None,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            response_text = knowledge_response.response
            
            # Validate output - remove AI disclaimers
            ai_disclaimers = [
                "As an AI language model",
                "I'm an AI assistant",
                "I am a highly advanced artificial intelligence",
                "As an artificial intelligence"
            ]
            for disclaimer in ai_disclaimers:
                if disclaimer in response_text:
                    # Try to extract just the answer after disclaimer
                    parts = response_text.split('.', 1)
                    if len(parts) > 1:
                        response_text = parts[1].strip()
            
            # Post-process: If response is too short or vague for practical questions, enhance it
            if needs_structured_answer and len(response_text) < 150:
                response_text = await self._generate_structured_fallback(message, message_lower, user_id)
            
            # Content filtering: Check for inappropriate or confusing responses
            if any(word in message_lower for word in ['joke', 'funny']):
                # For joke requests, validate the response
                inappropriate_indicators = [
                    'user question:', 'assistant answer:', 'america', 'marrying', 
                    'woman', 'ass', 'tizzy', 'insulting', 'cultural significance'
                ]
                
                if (any(indicator in response_text.lower() for indicator in inappropriate_indicators) or 
                    len(response_text) > 300 or 
                    'User Question:' in response_text):
                    
                    # Fall back to our clean jokes
                    jokes = [
                        "Why don't scientists trust atoms? Because they make up everything! 😄",
                        "What do you call a fake noodle? An impasta! 🍝",
                        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
                        "What's a computer's favorite snack? Microchips! 🖥️",
                        "Why don't skeletons fight each other? They don't have the guts! 💀"
                    ]
                    import random
                    response_text = f"Here's a clean joke for you:\n\n{random.choice(jokes)}"
            
            # Add emotional awareness for negative emotions only (not for jokes)
            elif emotion_result['confidence'] > 0.7 and emotion in ['anger', 'fear', 'sadness']:
                if emotion == 'anger':
                    response_text = f"I understand you might be frustrated. Let me help you with that:\n\n{response_text}"
                elif emotion == 'fear':
                    response_text = f"I can sense some concern. Here's what I can share:\n\n{response_text}"
                elif emotion == 'sadness':
                    response_text = f"I'm here to help. Let me share what I know:\n\n{response_text}"
            
            return {
                'text': response_text,
                'type': 'knowledge_focused',
                'model': knowledge_response.model_name,
                'confidence': 'high',
                'sources': 'ollama_ai'
            }
            
        except Exception as e:
            logger.error(f"Knowledge request failed: {e}")
            
            # Enhanced fallback for common requests
            message_lower = message.lower()
            if 'joke' in message_lower:
                jokes = [
                    "Why don't scientists trust atoms? Because they make up everything! 😄",
                    "Why did the programmer quit his job? He didn't get arrays! 💻", 
                    "What do you call a bear with no teeth? A gummy bear! 🐻",
                    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
                    "What's a computer's favorite snack? Microchips! 🖥️",
                    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
                    "What do you call a fake noodle? An impasta! 🍝",
                    "Why don't skeletons fight each other? They don't have the guts! 💀",
                    "What did the ocean say to the beach? Nothing, it just waved! 🌊",
                    "Why did the math book look so sad? Because it had too many problems! 📚"
                ]
                import random
                return {
                    'text': f"Here's a joke for you:\n\n{random.choice(jokes)}",
                    'type': 'knowledge_focused',
                    'model': 'fallback_jokes',
                    'sources': 'built_in'
                }
            
            return {
                'text': "I'd be happy to help you with that! I'm having some technical difficulties with my knowledge engine right now, but I can still assist. Could you try rephrasing your question or let me know what specific information you're looking for?",
                'type': 'knowledge_focused',
                'model': 'fallback',
                'error': str(e)
            }
    
    async def _handle_hybrid_response(self, message: str, emotion_result: Dict, user_id: str) -> Dict:
        """
        Handle messages needing both emotional support and practical information.
        Perfect for: "I'm happy and want to learn", "I'm scared but need to know", etc.
        """
        
        emotion = emotion_result['primary']
        confidence = emotion_result['confidence']
        message_lower = message.lower()
        
        try:
            # Build emotion-aware prompt for knowledge engine
            emotional_context = ""
            
            # Positive emotions (joy, love, surprise)
            if emotion == 'joy':
                if 'learn' in message_lower or 'want to' in message_lower:
                    emotional_context = f"The user is feeling JOYFUL and excited to learn! Match their positive energy. Start with: 'I love your enthusiasm! Let's dive in!' Then provide the information they want in an upbeat, engaging way."
                else:
                    emotional_context = f"The user is happy! Keep the response upbeat and positive."
            
            elif emotion == 'love':
                emotional_context = f"The user is feeling affectionate/passionate. Respond warmly and enthusiastically."
            
            elif emotion == 'surprise':
                emotional_context = f"The user is surprised/curious. Build on their curiosity with an exciting explanation."
            
            # Negative emotions (sadness, anger, fear)
            elif emotion == 'sadness':
                emotional_context = f"The user is feeling sad but seeking knowledge. Be gentle and supportive while providing helpful information. Acknowledge their effort to learn despite feeling down."
            
            elif emotion == 'anger':
                emotional_context = f"The user is frustrated but needs information. Be calm, clear, and help them solve their problem efficiently."
            
            elif emotion == 'fear':
                emotional_context = f"The user is anxious but seeking knowledge. Be reassuring and patient. Break down information into simple, confidence-building steps."
            
            # Extract the actual learning request
            learning_request = message
            # Remove emotional prefixes to get clean question
            for prefix in ['in this happy mode', 'in this mood', 'feeling good', 'excited to', 'i\'m happy']:
                learning_request = learning_request.lower().replace(prefix, '').strip()
            
            # Clean up "i want to learn" to just the topic
            if 'want to learn' in learning_request:
                learning_request = learning_request.split('want to learn')[-1].strip()
            if 'teach me' in learning_request:
                learning_request = learning_request.split('teach me')[-1].strip()
            
            # If too vague, ask for clarification emotionally
            if len(learning_request) < 10 or learning_request in ['something', 'something new', 'new things', '']:
                if emotion == 'joy':
                    return {
                        'text': "I LOVE your energy! 🌟 You're in such a great mood to learn - that's when learning is most fun!\n\nWhat specifically interests you right now?\n• Programming: Python, JavaScript, AI?\n• Science: Physics, Biology, Space?\n• Skills: Cooking, Art, Music?\n• Languages: Spanish, French, Japanese?\n• Anything else you're curious about?\n\nI'm excited to explore it with you! 🎯",
                        'type': 'hybrid',
                        'model': 'emotion_aware_clarification',
                        'emotional_component': 'joy_acknowledgment',
                        'knowledge_component': 'clarification_needed'
                    }
                else:
                    return {
                        'text': f"I can sense you're feeling {emotion} and want to learn something. That's wonderful! 💙\n\nWhat topic would you like to explore? I can help with:\n• Technology & Programming\n• Science & Nature\n• Arts & Culture\n• Skills & Hobbies\n• Or anything else!\n\nWhat catches your interest?",
                        'type': 'hybrid',
                        'model': 'emotion_aware_clarification'
                    }
            
            # Build emotion-aware introduction
            emotion_intro = ""
            if emotion == 'joy':
                emotion_intro = "I love your enthusiasm! Let's dive in! 🌟\n\n"
            elif emotion == 'love':
                emotion_intro = "I can feel your passion! This is great! ❤️\n\n"
            elif emotion == 'surprise':
                emotion_intro = "Ooh, interesting question! 🤔\n\n"
            elif emotion == 'sadness':
                emotion_intro = "I'm here to help you learn. 💙\n\n"
            elif emotion == 'fear':
                emotion_intro = "Don't worry, I'll explain this clearly. 🤝\n\n"
            elif emotion == 'anger':
                emotion_intro = "Let me help you understand this. 🎯\n\n"
            
            # Get knowledge response with JUST the learning request (not instructions)
            knowledge_response = await self.knowledge_engine.ask(
                question=learning_request,  # Just the topic, NOT the emotional instructions!
                context=None,
                emotion=emotion,
                temperature=0.7,
                max_tokens=400
            )
            
            response_text = knowledge_response.response
            
            # Add emotional introduction
            full_response = emotion_intro + response_text
            
            # Add encouraging closing for positive emotions
            if emotion == 'joy':
                full_response += "\n\nKeep that positive energy going - it's the best way to learn! ✨"
            
            return {
                'text': full_response,
                'type': 'hybrid',
                'model': knowledge_response.model_name,
                'emotional_component': emotion,
                'knowledge_component': 'emotion_aware_learning'
            }
            
        except Exception as e:
            logger.error(f"Hybrid response failed: {e}")
            # Fallback to emotional support if knowledge fails
            return await self._handle_emotional_support(message, emotion_result, user_id)
    
    async def _handle_casual_chat(self, message: str, emotion_result: Dict, user_id: str) -> Dict:
        """Handle casual conversation naturally using Ollama - like chatting with a friend."""
        
        context = emotion_result['context']
        emotion = emotion_result['primary']
        message_lower = message.lower().strip()
        
        # Get user profile for personality settings AND gender
        profile = None
        gender_personality = None
        try:
            profile = self.memory_service.get_or_create_profile(user_id)
            gender_personality = self._get_gender_personality(profile)
        except Exception as e:
            logger.debug(f"Could not load profile for casual chat: {e}")
        
        # PRIORITY CHECK: Instant knowledge base for common questions (emotional + factual)
        # This runs BEFORE emotional templates to catch specific phrases like "I don't feel good enough"
        simple_answer = self.knowledge_engine._check_simple_facts(message_lower)
        if simple_answer:
            return {
                'text': simple_answer,
                'type': 'casual_chat',
                'model': 'instant_knowledge_base'
            }
        
        # FAST PATH: Ultra-simple greetings get gender-appropriate instant templates (1-5ms)
        simple_greetings = ['hi', 'hello', 'hey', 'sup', 'yo']
        if message_lower in simple_greetings and len(message.split()) == 1:
            import random
            if gender_personality:
                # Use gender-appropriate greetings
                return {
                    'text': random.choice(gender_personality['greeting_examples']),
                    'type': 'casual_chat',
                    'model': 'gender_template'
                }
            else:
                quick_greets = [
                    "Hey! What's on your mind?",
                    "Hi there! How can I help?",
                    "Hello! I'm here for you."
                ]
                return {
                    'text': random.choice(quick_greets),
                    'type': 'casual_chat',
                    'model': 'instant_template'
                }
        
        # EMOTIONAL DETECTION: Detect emotional state from templates
        # These patterns help identify emotions - Ollama will generate the response
        emotional_patterns = {
            'sadness': ['sad', 'depressed', 'down', 'crying', 'hopeless', 'empty', 'broken'],
            'anxiety': ['anxious', 'worried', 'stressed', 'overthinking', 'panic', 'nervous', 'tense'],
            'anger': ['angry', 'mad', 'frustrated', 'irritated', 'furious', 'betrayed'],
            'loneliness': ['lonely', 'alone', 'isolated', 'no friends', 'left out', 'invisible'],
            'confusion': ['confused', 'lost', 'unclear', 'stuck', 'directionless', 'don\'t know'],
            'shame': ['guilty', 'ashamed', 'regret', 'mistake', 'bad person'],
            'burnout': ['tired', 'exhausted', 'drained', 'overwhelmed', 'burned out', 'giving up'],
            'low_confidence': ['not good enough', 'failure', 'useless', 'insecure', 'doubt myself'],
            'heartbreak': ['heartbreak', 'broke up', 'miss someone', 'love hurts', 'can\'t move on'],
            'joy': ['happy', 'excited', 'great', 'wonderful', 'amazing', 'joyful']
        }
        
        detected_emotion = None
        for emotion_type, keywords in emotional_patterns.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_emotion = emotion_type
                break
        
        # If strong emotional content detected, let Ollama generate empathetic response
        # (Skip simple greetings and questions - only emotional expressions)
        is_emotional_expression = (
            detected_emotion is not None and
            not any(q in message_lower for q in ['how to', 'how can i', 'what is', 'explain', 'tell me about', 'write'])
        )
        
        # FAST PATH 2: Learning requests - instant template with topics (NO Ollama needed)
        learning_keywords = ['want to learn', 'learn something', 'teach me', 'i want to', 'what should i learn']
        is_learning_request = any(kw in message_lower for kw in learning_keywords)
        
        if is_learning_request and 'code' not in message_lower and 'program' not in message_lower:
            # Learning question but NOT coding - give instant topic suggestions
            import random
            learning_responses = [
                """That's awesome! Here are some exciting things you can learn:

**Tech & Programming:**
• Python basics - great for beginners!
• Web development (HTML, CSS, JavaScript)
• Data science fundamentals

**Creative Skills:**
• Digital art & design
• Music production
• Creative writing

**Personal Growth:**
• New language (Spanish, French, Japanese)
• Photography techniques
• Cooking & baking

What interests you most? I can give you specific tips! 🌟""",
                """I love your enthusiasm for learning! Here are some popular topics:

📚 **Knowledge:**
• Science & nature
• History & culture
• Psychology & mindfulness

💻 **Technology:**
• Coding & programming
• AI & machine learning
• Cybersecurity basics

🎨 **Creative:**
• Drawing & painting
• Music (instrument or theory)
• Video editing

✨ Pick one and let me know - I'll help you get started!"""
            ]
            return {
                'text': random.choice(learning_responses),
                'type': 'casual_chat',
                'model': 'instant_learning_template'
            }
        
        # Get conversation context for natural flow
        conv_context = self.memory_service.get_conversation_context(user_id)
        last_bot_message = None
        recent_context = ""
        if conv_context and conv_context.messages:
            last_bot_message = conv_context.messages[-1].get('assistant', '')
            # Get last 2 exchanges for context
            if len(conv_context.messages) >= 2:
                recent = conv_context.messages[-2:]
                context_parts = []
                for msg in recent:
                    if 'user' in msg:
                        context_parts.append(f"User: {msg['user'][:100]}")
                if context_parts:
                    recent_context = "\n".join(context_parts)
        
        # ==================== EMOTIONAL CONTENT DETECTION ====================
        
        # CRITICAL: If emotional distress detected, use emotional support instead
        emotional_keywords = [
            'depress', 'sad', 'hurt', 'scared', 'worried', 'anxious', 'crying',
            'devastated', 'horrible', 'terrible', 'awful', 'lonely', 'alone',
            'hopeless', 'helpless', 'worthless', 'furious', 'frustrated'
        ]
        
        if any(kw in message_lower for kw in emotional_keywords):
            logger.info(f"Detected emotional distress - routing to emotional support")
            return await self._handle_emotional_support(message, emotion_result, user_id)
        
        # If strong negative emotion, use emotional support
        if emotion in ['sadness', 'anger', 'fear'] and emotion_result['confidence'] > 0.6:
            logger.info(f"Strong negative emotion detected - using emotional support")
            return await self._handle_emotional_support(message, emotion_result, user_id)
        
        # SMART PATH: Use Ollama for natural, emotionally-aware conversation (200-400ms)
        try:
            # Initialize knowledge engine if needed
            if not self.knowledge_engine.is_ready():
                await self.knowledge_engine.initialize()
            
            # Build SHORT, focused prompt for natural conversation
            emotion_note = ""
            if emotion != 'neutral' and emotion_result['confidence'] > 0.5:
                emotion_note = f" (They seem {emotion})"
            
            context_note = ""
            if recent_context:
                context_note = f"\n\nRecent context:\n{recent_context}"
            
            # Apply personality settings from profile
            response_length = "2-3 sentences"
            tone_style = "warm and friendly"
            
            if profile:
                # Verbosity level (0-100)
                if hasattr(profile, 'verbosity_level'):
                    if profile.verbosity_level < 30:
                        response_length = "1-2 sentences, keep it brief"
                    elif profile.verbosity_level > 70:
                        response_length = "4-6 sentences with more detail"
                
                # Formality + Humor combined
                if hasattr(profile, 'formality_level') and hasattr(profile, 'humor_level'):
                    formality = profile.formality_level
                    humor = profile.humor_level
                    
                    if formality < 30 and humor > 70:
                        tone_style = "very casual and playful with humor"
                    elif formality > 70 and humor < 30:
                        tone_style = "polite, respectful and serious"
                    elif formality < 30:
                        tone_style = "casual and relaxed"
                    elif humor > 70:
                        tone_style = "friendly with light humor"
                    elif formality > 70:
                        tone_style = "polite and respectful"
                
                logger.debug(f"Casual chat profile: formality={getattr(profile, 'formality_level', 50)}, verbosity={getattr(profile, 'verbosity_level', 50)}, humor={getattr(profile, 'humor_level', 50)}")
            
            # Build context string from recent_context for AI
            context_for_ai = None
            if recent_context:
                context_for_ai = recent_context
            
            # Simple prompt - just the message
            prompt = message
            
            # Determine max_tokens based on gender personality
            max_tokens = 40  # Default
            if gender_personality:
                max_tokens = gender_personality['max_words_casual']
                logger.debug(f"Using gender-based casual length: {max_tokens} words ({gender_personality['greeting_style']} style)")
            
            # Let Ollama generate natural response with conversation memory and detected emotion
            response_data = await self.knowledge_engine.ask(
                question=prompt,
                context=context_for_ai,  # Pass recent conversation history
                emotion=detected_emotion if is_emotional_expression else emotion,  # Use template-detected emotion
                temperature=0.9,
                max_tokens=max_tokens  # Gender-adjusted length
            )
            
            response = response_data.response
            
        except Exception as e:
            logger.error(f"Ollama casual chat failed: {e}")
            # Simple fallback
            response = "I'm here and listening. What would you like to talk about?"
        
        return {
            'text': response,
            'type': 'casual_chat',
            'model': 'ollama_conversational',
            'tone': 'natural_friend',
            'emotionally_aware': True
        }
    
    async def _handle_default_response(self, message: str, emotion_result: Dict, user_id: str) -> Dict:
        """Fallback for unclear or complex messages."""
        
        response = "I want to make sure I understand you correctly. Could you help me by sharing a bit more about what you're looking for? I'm here to help with information, provide support, or just have a conversation - whatever would be most helpful for you right now."
        
        return {
            'text': response,
            'type': 'clarification',
            'model': 'default',
            'needs_clarification': True
        }
    
    def _get_brief_emotional_acknowledgment(self, emotion: str, confidence: float) -> Optional[str]:
        """Get brief emotional acknowledgment for hybrid responses."""
        
        if confidence < 0.6:
            return None
        
        acknowledgments = {
            'sadness': "I can sense you're going through something difficult.",
            'anger': "I understand this is frustrating for you.",
            'fear': "I can see this is concerning to you.",
            'joy': "I can hear the excitement in your message!",
            'surprise': "That does sound surprising!",
            'love': "I can feel the passion in your words."
        }
        
        return acknowledgments.get(emotion)
    
    async def _generate_structured_fallback(self, original_message: str, message_lower: str, user_id: str = "default") -> str:
        """
        Force Ollama to regenerate with better prompt when initial response was too short/vague.
        This uses AI with FULL conversation context.
        """
        try:
            # Get conversation history for context
            context_summary = ""
            conv_history = self.memory_service.get_conversation_context(user_id)
            if conv_history and conv_history.messages:
                recent = conv_history.messages[-3:]
                context_lines = []
                for msg in recent:
                    if 'user' in msg:
                        context_lines.append(f"User: {msg['user']}")
                    if 'assistant' in msg:
                        context_lines.append(f"Assistant: {msg['assistant'][:200]}...")
                if context_lines:
                    context_summary = f"\n\nCONVERSATION CONTEXT:\n" + "\n".join(context_lines) + "\n"
            
            # Build enhanced prompt that forces structured output
            enhanced_prompt = f"""The user is asking a practical question about applications, forms, or career advice.{context_summary}

Their current question: "{original_message}"

You MUST provide a STRUCTURED, PROFESSIONAL answer with SPECIFIC OPTIONS:

Format:

**Option 1: [Specific Approach Title]**
Explanation: [2-3 sentences about this approach]

Example Answer:
"[Word-for-word professional text they can copy directly into their application]"

**Option 2: [Different Approach Title]**
Explanation: [2-3 sentences]

Example Answer:
"[Another ready-to-use professional response]"

**Option 3: [Another Approach]**
Explanation: [2-3 sentences]

Example Answer:
"[Third option they can use]"

Key Requirements:
- Identify and reference the SPECIFIC company/program mentioned in the conversation (could be Google, Amazon, Microsoft, any university, etc.)
- Give them ACTUAL TEXT they can copy with the correct company name
- Be professional, clear, and actionable
- Each option should be meaningfully different
- Tailor reasons to that specific company/program's strengths

End with: "Would you like me to customize any of these based on your background?"

Now generate this structured response:"""

            # Query Ollama with enhanced prompt
            knowledge_response = await self.knowledge_engine.ask(
                question=enhanced_prompt,
                context=None,
                emotion='neutral',
                temperature=0.3,  # Low temperature for consistent, professional output
                max_tokens=800
            )
            
            return knowledge_response.response
            
        except Exception as e:
            logger.error(f"Structured fallback AI generation failed: {e}")
            # Only if AI completely fails, give minimal guidance
            return f"""I understand you're asking about: "{original_message}"

Let me help you with that. Could you provide a bit more detail about:
• What type of application or form this is for?
• What specific question or field you need help with?

This will help me give you the most relevant, specific answer!"""
    
    def _generate_supportive_followup(self, emotion: str, intensity_level: str) -> str:
        """Generate supportive follow-up questions or suggestions."""
        
        followups = {
            'sadness': {
                'high': "Would it help to talk about what's causing you the most pain right now? Sometimes sharing can lighten the burden.",
                'medium': "Is there something specific that's been weighing on your mind? I'm here to listen.",
                'low': "Would you like to share what's been on your mind? Sometimes talking helps."
            },
            'anger': {
                'high': "What would feel most helpful right now - talking through what happened, or focusing on what might help you feel better?",
                'medium': "Would you like to tell me more about what's been frustrating you? Sometimes it helps to get it out.",
                'low': "Is there something specific that's been bothering you? I'm here to listen."
            },
            'fear': {
                'high': "What would help you feel safer or more confident right now? We can work through this together.",
                'medium': "Would it help to talk about what's been worrying you? Sometimes understanding our fears makes them less powerful.",
                'low': "Is there something specific you're concerned about? I'm here to help however I can."
            }
        }
        
        return followups.get(emotion, {}).get(intensity_level, "Is there anything specific I can help you with right now?")
    
    def _enhance_with_personality(self, reply_data: Dict, user_id: str, profile=None) -> Dict:
        """Add personality traits to the response based on user preferences."""
        
        # Use user's profile personality settings if available
        if profile:
            personality_traits = {
                'warmth': profile.empathy_level / 100,
                'helpfulness': 0.9,  # Always helpful
                'empathy': profile.empathy_level / 100,
                'intelligence': 0.8,
                'humor': profile.humor_level / 100,
                'formality': profile.formality_level / 100,
                'verbosity': profile.verbosity_level / 100,
                'proactiveness': profile.proactiveness_level / 100
            }
            
            # Apply verbosity adjustment (concise vs detailed)
            if 'text' in reply_data:
                text = reply_data['text']
                
                # If low verbosity (< 40), make response more concise
                if profile.verbosity_level < 40:
                    # Keep only the most essential sentences
                    sentences = text.split('. ')
                    if len(sentences) > 2:
                        # Keep first 2 sentences and closing
                        text = '. '.join(sentences[:2]) + '.'
                
                # If high verbosity (> 70), add more context/explanation
                elif profile.verbosity_level > 70:
                    # Add contextual phrases if not already detailed
                    if len(text.split()) < 30:  # If response is short
                        if 'emotion' in reply_data and reply_data.get('emotion') != 'neutral':
                            text = text + " I understand this might be important to you, and I'm here to help however I can."
                
                # Apply proactiveness (offer suggestions/ask questions)
                if profile.proactiveness_level > 60 and not text.endswith('?'):
                    proactive_additions = [
                        " Would you like to explore this further?",
                        " Is there anything specific you'd like to know more about?",
                        " Let me know if you need any clarification!",
                        " Feel free to ask if you have any questions.",
                        " What would you like to talk about next?"
                    ]
                    import random
                    text = text + proactive_additions[random.randint(0, len(proactive_additions) - 1)]
                
                reply_data['text'] = text
            
            # Adjust response based on emoji preference
            if not profile.emoji_usage and 'text' in reply_data:
                # Remove emojis if user doesn't like them
                import re
                reply_data['text'] = re.sub(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251]+', '', reply_data['text'])
        else:
            # Default personality
            personality_traits = {
                'warmth': 0.8,
                'helpfulness': 0.9,
                'empathy': 0.7,
                'intelligence': 0.8,
                'humor': 0.5,
                'formality': 0.5,
                'verbosity': 0.5,
                'proactiveness': 0.5
            }
        
        reply_data['personality_traits'] = personality_traits
        
        return reply_data
    
    def _update_memory(self, user_id: str, message: str, reply: Dict, emotion_result: Dict):
        """Update conversation memory for personalization."""
        
        if user_id not in self.conversation_memory:
            self.conversation_memory[user_id] = {
                'message_count': 0,
                'emotion_history': [],
                'topics': [],
                'last_interaction': None
            }
        
        memory = self.conversation_memory[user_id]
        memory['message_count'] += 1
        memory['emotion_history'].append({
            'emotion': emotion_result['primary'],
            'confidence': emotion_result['confidence'],
            'timestamp': datetime.now().isoformat()
        })
        memory['last_interaction'] = datetime.now().isoformat()
        
        # Keep memory size manageable
        if len(memory['emotion_history']) > 50:
            memory['emotion_history'] = memory['emotion_history'][-50:]
    
    def _detect_context(self, message: str) -> str:
        """Detect the context type of the message."""
        message_lower = message.lower().strip()
        
        # Gratitude patterns
        gratitude_words = ['thank you', 'thanks', 'thank u', 'thx', 'tysm', 'appreciate']
        if any(word in message_lower for word in gratitude_words):
            return 'gratitude'
        
        # Clarification/Negation patterns - user explaining they're NOT emotional
        clarification_patterns = [
            'i am not', "i'm not", 'im not', 'not in', 'not feeling',
            'just asked', 'just asking', 'just want to', 'just wanted',
            'only wanted', 'only asking', 'didnt mean', "didn't mean"
        ]
        if any(pattern in message_lower for pattern in clarification_patterns):
            return 'clarification'
        
        # POSITIVE EMOTION + LEARNING patterns (e.g., "in this happy mode i want to learn")
        positive_learning_patterns = [
            'happy mode', 'in this mood', 'feeling good', 'excited to learn',
            'joyful', 'feeling great', 'in good spirits', 'positive mood'
        ]
        if any(pattern in message_lower for pattern in positive_learning_patterns):
            return 'emotional_learning'
        
        # Greeting patterns - use word boundaries to avoid "explain" matching "hi"
        greetings = ['hi ', ' hi', 'hello', 'hey ', ' hey', 'good morning', 'good afternoon', 'good evening']
        if any(greeting in message_lower for greeting in greetings) or message_lower in ['hi', 'hey']:
            return 'greeting'
        
        # PRIORITY 1: Check for CODE/PROGRAMMING requests FIRST before casual conversation
        # This prevents "can you give code" from being classified as casual chat
        practical_keywords = [
            'applied', 'application', 'job', 'career', 'resume', 'cv', 'interview',
            'form', 'fill', 'include on', 'what to include', 'give what',
            'bank', 'account', 'money', 'paypal', 'company', 'position',
            # CODE/PROGRAMMING requests
            'code for', 'program for', 'script for', 'function for',
            'write code', 'create code', 'generate code', 'make code',
            'api connection', 'connect to api', 'rest api', 'api call',
            'python code', 'javascript code', 'java code',
            'algorithm for', 'function to', 'class for'
        ]
        
        # Generic help/need/want patterns - include "i want" patterns
        generic_requests = [
            'help me with', 'need to', 'want to know', 'explain', 'tell me about',
            'i want a code', 'i want code', 'want a program', 'want to make',
            'give me code', 'show me code', 'need code for', 'looking for code',
            'can you give', 'give a', 'give me a'
        ]
        
        # PRIORITY: Check practical requests FIRST
        if any(keyword in message_lower for keyword in practical_keywords):
            return 'practical_request'
        
        if any(req in message_lower for req in generic_requests):
            return 'practical_request'
        
        # CASUAL CONVERSATION patterns - check AFTER practical requests
        # These are social pleasantries, NOT knowledge questions
        casual_phrases = [
            'how are you', 'how r you', 'how r u', 'how are u',
            'what\'s up', 'whats up', 'sup', 'wassup',
            'how\'s it going', 'hows it going', 'how is it going',
            'how are things', 'how\'s everything', 'hows everything',
            'what are you doing', 'what r u doing', 'whatcha doing',
            'tell me something', 'say something', 'talk to me',
            'i\'m bored', 'im bored', 'bored'
        ]
        if any(phrase in message_lower for phrase in casual_phrases):
            return 'casual_conversation'
        
        # Question patterns - CHECK AFTER practical requests and casual conversation
        if message_lower.startswith(('what is', 'what are', 'who is', 'who are', 'explain', 'define')):
            return 'question'
        if message_lower.startswith(('how does', 'how do', 'how can', 'how to')):
            return 'question'
        if message_lower.startswith(('why', 'when', 'where', 'can you')):
            return 'question'
        
        # Incomplete questions that need context from conversation history
        incomplete_questions = ['give what', 'what to', 'how to', 'which', 'include what', 'need what', 'say what']
        if any(pattern in message_lower for pattern in incomplete_questions):
            return 'question'
        
        # Default to emotional expression
        return 'emotional_expression'
    
    def _get_gender_personality(self, profile) -> Dict[str, Any]:
        """
        Get gender-based personality configuration for response adaptation.
        
        Returns personality settings that affect:
        - Greeting style (casual vs warm)
        - Emotional response tone (solution-focused vs empathetic)
        - Response length (concise vs detailed)
        - Language style (direct vs caring)
        """
        gender = getattr(profile, 'gender', 'not_set')
        
        if gender == 'male':
            return {
                'greeting_style': 'casual_direct',
                'greeting_examples': [
                    "Hey! What's up?",
                    "Hi there! How's it going?",
                    "What's on your mind?",
                    "Hey, how can I help?"
                ],
                'emotional_approach': 'solution_focused',
                'emotional_tone': 'direct and supportive',
                'response_style': 'concise',
                'max_words_casual': 30,
                'max_words_emotional': 50,
                'max_words_knowledge': 100,
                'language_style': 'straightforward',
                'empathy_modifier': 0.8,  # Slightly less verbose empathy
                'examples': {
                    'sadness': "That's tough, man. Want to talk about what's causing it? Sometimes identifying the problem helps us find solutions.",
                    'anger': "I get it. That sounds frustrating. What specifically is bothering you? Let's figure out how to tackle this.",
                    'joy': "That's great! Good to hear things are going well for you.",
                    'neutral': "Sure, I can help with that. What do you need?"
                }
            }
        elif gender == 'female':
            return {
                'greeting_style': 'warm_caring',
                'greeting_examples': [
                    "Hi there! How are you feeling today?",
                    "Hello! I'm here for you. What's on your mind?",
                    "Hi! How has your day been?",
                    "Hey! I'd love to hear how you're doing."
                ],
                'emotional_approach': 'empathetic_listening',
                'emotional_tone': 'warm and understanding',
                'response_style': 'detailed',
                'max_words_casual': 40,
                'max_words_emotional': 70,
                'max_words_knowledge': 120,
                'language_style': 'caring and gentle',
                'empathy_modifier': 1.2,  # More verbose, caring responses
                'examples': {
                    'sadness': "I'm so sorry you're feeling this way. I'm here to listen. Would you like to share what's been on your mind? Sometimes it really helps to talk it out.",
                    'anger': "I can hear that you're really upset, and that's completely valid. Your feelings matter. What happened that made you feel this way?",
                    'joy': "I'm so happy to hear that! It's wonderful when good things happen. What made you feel so joyful?",
                    'neutral': "Of course! I'm here to help. How can I support you today?"
                }
            }
        else:  # 'other' or 'not_set'
            return {
                'greeting_style': 'friendly_balanced',
                'greeting_examples': [
                    "Hi! How are you?",
                    "Hello! What can I help you with?",
                    "Hey there! How's everything going?",
                    "Hi! What's on your mind?"
                ],
                'emotional_approach': 'balanced_supportive',
                'emotional_tone': 'friendly and supportive',
                'response_style': 'moderate',
                'max_words_casual': 35,
                'max_words_emotional': 60,
                'max_words_knowledge': 110,
                'language_style': 'balanced and inclusive',
                'empathy_modifier': 1.0,  # Balanced empathy
                'examples': {
                    'sadness': "I'm sorry you're going through this. I'm here to listen and support you. What's been troubling you?",
                    'anger': "That sounds really frustrating. Your feelings are valid. Would you like to talk about what happened?",
                    'joy': "That's wonderful! I'm glad to hear you're feeling good. What's making you happy?",
                    'neutral': "Sure, I'm here to help. What would you like to know?"
                }
            }
    
    def _check_emotional_negation(self, message: str) -> bool:
        """
        Check if user is saying they're NOT feeling emotional (negation).
        Returns True if negation detected.
        """
        message_lower = message.lower().strip()
        
        # Negation patterns - user saying they're NOT feeling something
        negation_patterns = [
            'i am not in sad', "i'm not in sad", 'im not sad', 'not sad',
            'i am not sad', "i'm not sad", 'not feeling sad',
            'i am not angry', "i'm not angry", 'im not angry', 'not angry',
            'not mad', "i'm not mad", 'im not mad',
            'i am not upset', "i'm not upset", 'not upset',
            'not depressed', 'not feeling', 'i am not in',
            'just asked', 'just asking', 'just wanted to',
            'only asked', 'only wanted', 'just want to know',
            'not in sad', 'not in angry', 'not in fear'
        ]
        
        # Check if message contains negation
        has_negation = any(pattern in message_lower for pattern in negation_patterns)
        
        # Additional check: if message contains "not" or "no" near emotion words
        if ('not' in message_lower or 'no' in message_lower):
            emotion_words = ['sad', 'angry', 'mad', 'upset', 'depressed', 'scared', 'fear', 'worried', 'anxious']
            for emotion in emotion_words:
                if emotion in message_lower:
                    # Check if "not" or "no" appears within 10 characters before the emotion word
                    emotion_pos = message_lower.find(emotion)
                    preceding_text = message_lower[max(0, emotion_pos - 15):emotion_pos]
                    if 'not' in preceding_text or 'no' in preceding_text or "n't" in preceding_text:
                        return True
        
        return has_negation
    
    def _error_response(self, error_msg: str) -> Dict:
        """Generate error response."""
        return {
            'message': "I apologize, but I'm having some technical difficulties right now. Please try again in a moment, or let me know if there's anything else I can help you with.",
            'emotion': {'primary': 'neutral', 'confidence': 0.5},
            'strategy': 'error',
            'metadata': {'error': error_msg}
        }


# Global instance
intelligent_reply_engine = IntelligentReplyEngine()