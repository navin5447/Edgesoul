from typing import Dict, Optional
from loguru import logger
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

from core.config import settings

# Try to import ONNX service for faster inference
try:
    from services.onnx_emotion_service import onnx_emotion_service, ONNX_AVAILABLE
    USE_ONNX = ONNX_AVAILABLE and onnx_emotion_service is not None
except ImportError:
    USE_ONNX = False
    onnx_emotion_service = None


class EmotionService:
    """Service for emotion detection with optional ONNX acceleration."""
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.emotion_labels = ["joy", "sadness", "anger", "fear", "surprise", "neutral"]
        self.is_loaded = False
        self.use_onnx = USE_ONNX
        
        if self.use_onnx:
            logger.info("🚀 ONNX acceleration enabled for emotion detection")
    
    async def load_model(self):
        """Load the emotion detection model."""
        # If ONNX is available, skip PyTorch loading
        if self.use_onnx:
            logger.info("Using ONNX model - skipping PyTorch model loading")
            self.is_loaded = True
            return
        
        try:
            logger.info("Loading emotion detection model...")
            
            # For demo purposes, we'll use a pre-trained model
            # In production, replace with your fine-tuned model
            model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            
            # Get the actual emotion labels from the model config
            if hasattr(self.model.config, 'id2label'):
                self.emotion_labels = [self.model.config.id2label[i] for i in range(len(self.model.config.id2label))]
                logger.info(f"Model emotion labels: {self.emotion_labels}")
            else:
                # Fallback to default if model doesn't have labels
                self.emotion_labels = ["sadness", "joy", "love", "anger", "fear", "surprise"]
                logger.warning("Using default emotion labels")
            
            # Move to GPU if available
            if torch.cuda.is_available():
                self.model = self.model.cuda()
                logger.info("Model loaded on GPU")
            else:
                logger.info("Model loaded on CPU")
            
            self.model.eval()
            self.is_loaded = True
            
            logger.info("Emotion detection model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load emotion model: {str(e)}")
            raise
    
    async def detect_emotion(self, text: str) -> Dict:
        """
        Detect emotion in text with improved neutral detection for greetings.
        Uses ONNX for faster inference if available.
        
        Returns:
            Dict with primary emotion, confidence, and all emotion scores
        """
        # PRE-CHECK for simple greetings, requests, and neutral phrases BEFORE running any model
        text_lower = text.lower().strip()
        neutral_patterns = [
            "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
            "how are you", "what's up", "okay", "ok", "bye", "goodbye", "see you",
            "hungry", "thirsty", "tired", "sleepy", "bored", "busy", "working", "eating"
        ]
        
        # Positive/neutral request patterns that should be neutral (not anger!)
        positive_request_patterns = [
            "can you", "could you", "please", "tell me a joke", "say a joke", "any joke",
            "make me laugh", "something funny"
        ]
        
        # Factual questions should be neutral, not joy
        question_patterns = [
            "what can you", "how do you", "explain", "help me", "show me", "teach me",
            "what is", "who is", "where is", "when is", "why is"
        ]
        
        # Practical questions/applications should be neutral (not anger!)
        practical_neutral_patterns = [
            "applied", "application", "job", "career", "resume", "cv", "interview",
            "paypal", "company", "position", "why did you choose", "form", "fill",
            "include on", "what to include", "give what", "need what"
        ]
        
        # Practical questions FIRST (job applications, forms - NOT anger!)
        if any(pattern in text_lower for pattern in practical_neutral_patterns):
            return {
                "primary": "neutral",
                "confidence": 0.90,
                "all": {
                    "neutral": 0.90,
                    "joy": 0.05,
                    "surprise": 0.02,
                    "sadness": 0.01,
                    "anger": 0.01,
                    "fear": 0.01
                },
            }
        
        # Frustration/anger expressions (MUST detect BEFORE ONNX model runs!)
        frustration_patterns = [
            "frustrated", "frustrating", "annoyed", "annoying", "irritated", "irritating",
            "pissed", "mad", "angry", "furious", "upset", "stressed", "hate this",
            "stupid", "ridiculous", "terrible", "awful", "doesn't work", "not working",
            "bug", "error", "broken", "failing", "fail"
        ]
        
        if any(pattern in text_lower for pattern in frustration_patterns):
            return {
                "primary": "anger",
                "confidence": 0.88,
                "all": {
                    "anger": 0.88,
                    "sadness": 0.06,
                    "neutral": 0.03,
                    "fear": 0.01,
                    "surprise": 0.01,
                    "joy": 0.01
                },
            }
        
        # Fear/anxiety expressions (MUST detect BEFORE ONNX model runs!)
        fear_patterns = [
            "afraid", "scared", "worried", "anxious", "nervous", "terrified", "panic",
            "fear", "fearful", "frightened", "in fear", "am in fear", "i'm in fear",
            "feel fear", "feeling fear", "feeling anxious", "feeling nervous"
        ]
        
        if any(pattern in text_lower for pattern in fear_patterns):
            return {
                "primary": "fear",
                "confidence": 0.88,
                "all": {
                    "fear": 0.88,
                    "sadness": 0.05,
                    "neutral": 0.03,
                    "anger": 0.02,
                    "surprise": 0.01,
                    "joy": 0.01
                },
            }
        
        # Casual states (hungry, tired, bored) are NEUTRAL not anger
        casual_states = ["hungry", "thirsty", "tired", "sleepy", "bored", "busy"]
        if any(state in text_lower for state in casual_states):
            return {
                "primary": "neutral",
                "confidence": 0.85,
                "all": {
                    "neutral": 0.85,
                    "joy": 0.05,
                    "sadness": 0.05,
                    "surprise": 0.02,
                    "anger": 0.02,
                    "fear": 0.01
                },
            }
        
        # Check for jokes/humor (these are joy)
        if any(pattern in text_lower for pattern in positive_request_patterns):
            return {
                "primary": "joy",
                "confidence": 0.85,
                "all": {
                    "joy": 0.85,
                    "neutral": 0.10,
                    "surprise": 0.03,
                    "sadness": 0.01,
                    "anger": 0.005,
                    "fear": 0.005
                },
            }
        
        # Factual questions are neutral
        if any(pattern in text_lower for pattern in question_patterns):
            return {
                "primary": "neutral",
                "confidence": 0.85,
                "all": {
                    "neutral": 0.85,
                    "joy": 0.08,
                    "surprise": 0.03,
                    "sadness": 0.02,
                    "anger": 0.01,
                    "fear": 0.01
                },
            }
        
        # Then check for simple greetings (should remain neutral)
        if any(pattern == text_lower for pattern in neutral_patterns) or (
            any(pattern in text_lower for pattern in neutral_patterns) and len(text_lower) <= 15
        ):
            return {
                "primary": "neutral",
                "confidence": 0.90,
                "all": {
                    "neutral": 0.90,
                    "joy": 0.04,
                    "sadness": 0.02,
                    "anger": 0.01,
                    "fear": 0.02,
                    "surprise": 0.01
                },
            }
        
        # Additional check for thanks/gratitude (should be neutral/positive)
        if any(word in text_lower for word in ['thank', 'thanks', 'thx']):
            return {
                "primary": "neutral",
                "confidence": 0.85,
                "all": {
                    "neutral": 0.85,
                    "joy": 0.10,
                    "sadness": 0.02,
                    "anger": 0.01,
                    "fear": 0.01,
                    "surprise": 0.01
                },
            }
        
        # Use ONNX if available for 2-3x speed improvement (after greeting checks)
        if self.use_onnx and onnx_emotion_service:
            try:
                result = await onnx_emotion_service.detect_emotion(text)
                # Apply post-processing to ONNX results too
                return self._post_process_emotion(text, result)
            except Exception as e:
                logger.warning(f"ONNX inference failed, falling back to PyTorch: {e}")
                # Continue with PyTorch inference below
        
        if not self.is_loaded:
            logger.warning("Model not loaded, using fallback")
            return self._fallback_detection(text)
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True,
            )
            
            # Move to GPU if available
            if torch.cuda.is_available():
                inputs = {k: v.cuda() for k, v in inputs.items()}
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                probabilities = torch.nn.functional.softmax(logits, dim=-1)
            
            # Convert to numpy
            probs = probabilities.cpu().numpy()[0]
            
            # Get all emotion scores
            emotion_scores = {
                label: float(score)
                for label, score in zip(self.emotion_labels, probs)
            }
            
            # Get primary emotion
            primary_idx = np.argmax(probs)
            primary_emotion = self.emotion_labels[primary_idx]
            confidence = float(probs[primary_idx])
            
            # Post-process: If model detects high joy for very short neutral text, adjust
            if (primary_emotion == "joy" and confidence > 0.8 and 
                len(text.strip()) <= 20 and 
                not any(keyword in text_lower for keyword in ["happy", "excited", "great", "wonderful", "awesome"])):
                
                return {
                    "primary": "neutral",
                    "confidence": 0.75,
                    "all": {
                        "neutral": 0.75,
                        "joy": confidence * 0.25,
                        **{k: v * 0.1 for k, v in emotion_scores.items() if k not in ["neutral", "joy"]}
                    },
                }
            
            return {
                "primary": primary_emotion,
                "confidence": confidence,
                "all": emotion_scores,
            }
        
        except Exception as e:
            logger.error(f"Error in emotion detection: {str(e)}")
            return self._fallback_detection(text)
    
    def _fallback_detection(self, text: str) -> Dict:
        """Fallback emotion detection using simple heuristics with improved neutral detection."""
        text_lower = text.lower().strip()
        
        # Check for simple greetings, requests, and neutral phrases first
        neutral_patterns = [
            "hi", "hello", "hey", "good morning", "good afternoon", "good evening",
            "how are you", "what's up", "thanks", "thank you", "okay", "ok", 
            "yes", "no", "maybe", "sure", "alright", "bye", "goodbye"
        ]
        
        # Humor requests (joy)
        humor_patterns = [
            "tell me a joke", "say a joke", "any joke", "make me laugh", "something funny"
        ]
        
        # Factual questions (neutral)
        question_patterns = [
            "can you", "could you", "please", "what can you", "how do you", 
            "explain", "help me", "show me", "teach me",
            "what is", "who is", "where is", "when is", "why is"
        ]
        
        # If it's a simple greeting or neutral phrase, return neutral
        if any(pattern in text_lower for pattern in neutral_patterns) and len(text_lower) <= 20:
            return {
                "primary": "neutral",
                "confidence": 0.90,
                "all": {
                    "neutral": 0.90,
                    "joy": 0.04,
                    "sadness": 0.02,
                    "anger": 0.01,
                    "fear": 0.02,
                    "surprise": 0.01
                },
            }
        
        # If it's a humor request, return joy
        if any(pattern in text_lower for pattern in humor_patterns):
            return {
                "primary": "joy",
                "confidence": 0.85,
                "all": {
                    "joy": 0.85,
                    "neutral": 0.10,
                    "surprise": 0.03,
                    "sadness": 0.01,
                    "anger": 0.005,
                    "fear": 0.005
                },
            }
        
        # If it's a factual question, return neutral (not joy!)
        if any(pattern in text_lower for pattern in question_patterns):
            return {
                "primary": "neutral",
                "confidence": 0.80,
                "all": {
                    "neutral": 0.80,
                    "joy": 0.10,
                    "surprise": 0.05,
                    "sadness": 0.02,
                    "anger": 0.01,
                    "fear": 0.02
                },
            }
        
        # Enhanced keyword-based detection for non-neutral content
        joy_keywords = ["happy", "joy", "excited", "great", "wonderful", "love", "awesome", "fantastic"]
        sad_keywords = ["sad", "unhappy", "depress", "down", "sorry", "disappointed", "hurt", "nobody", "alone", "hopeless", "no one", "noone", "isolated", "lonely"]
        anger_keywords = ["angry", "mad", "furious", "annoyed", "frustrated", "hate", "disgusted"]
        fear_keywords = ["afraid", "scared", "worried", "anxious", "nervous", "terrified", "panic", "fear", "fearful", "frightened"]
        surprise_keywords = ["wow", "amazing", "surprised", "unexpected", "incredible", "unbelievable"]
        
        scores = {
            "joy": sum(2 if kw in text_lower else 0 for kw in joy_keywords),
            "sadness": sum(2 if kw in text_lower else 0 for kw in sad_keywords),
            "anger": sum(2 if kw in text_lower else 0 for kw in anger_keywords),
            "fear": sum(2 if kw in text_lower else 0 for kw in fear_keywords),
            "surprise": sum(2 if kw in text_lower else 0 for kw in surprise_keywords),
            "neutral": 3,  # Give neutral a baseline score
        }
        
        # If no emotional keywords found, boost neutral
        if max(scores["joy"], scores["sadness"], scores["anger"], scores["fear"], scores["surprise"]) == 0:
            scores["neutral"] = 8
        
        total = sum(scores.values())
        emotion_scores = {k: v / total for k, v in scores.items()}
        
        primary = max(scores.items(), key=lambda x: x[1])[0]
        
        return {
            "primary": primary,
            "confidence": emotion_scores[primary],
            "all": emotion_scores,
        }
    
    def _post_process_emotion(self, text: str, result: Dict) -> Dict:
        """
        Post-process emotion detection to improve accuracy based on context.
        Handles cases like: being blamed/scolded should be sadness, not anger.
        Enhanced with better multi-emotion and context understanding.
        """
        text_lower = text.lower().strip()
        primary = result['primary']
        confidence = result['confidence']
        all_emotions = result.get('all', {})
        
        # For very short messages (like "hi", "hello"), don't post-process
        if len(text.strip().split()) <= 2 and confidence > 0.3:
            return result
        
        # Enhanced emotion indicators with better context
        victim_keywords = ["scold", "scolded", "blamed", "wrongly accused", "unfairly", "innocent", "punished", "criticized unfairly"]
        depression_keywords = ["no one understands", "depress", "nobody understands", "no one is", "nobody is", "no one talk", "nobody talk", "alone", "hopeless", "isolated", "lonely", "worthless", "meaningless"]
        wrongly_accused = ["i did not", "i didn't", "but i did not", "but i didn't", "not my fault but", "didn't do anything", "did nothing wrong"]
        
        # Fear/anxiety indicators that might be misclassified as anger
        fear_indicators = ["scared", "afraid", "worried", "anxious", "nervous", "terrified", "panic", "what if", "afraid of", "fear", "fearful", "frightened", "in fear"]
        
        # Joy indicators for positive reinforcement (might be misclassified as neutral)
        joy_indicators = ["happy", "excited", "awesome", "great", "wonderful", "love it", "amazing", "fantastic", "brilliant"]
        
        # Mixed emotion patterns (e.g., "I'm sad but trying to be strong")
        has_victim_context = any(kw in text_lower for kw in victim_keywords)
        has_depression = any(kw in text_lower for kw in depression_keywords)
        has_wrongly_accused = any(kw in text_lower for kw in wrongly_accused)
        has_fear = any(kw in text_lower for kw in fear_indicators)
        has_joy = any(kw in text_lower for kw in joy_indicators)
        
        # SMART CORRECTION 1: Anger → Sadness (victim/unfair treatment)
        if primary == "anger" and (has_victim_context or has_depression or has_wrongly_accused):
            logger.info(f"Post-processing: Changed anger → sadness (victim context detected)")
            return {
                "primary": "sadness",
                "confidence": max(0.78, all_emotions.get('sadness', 0.5)),
                "all": {
                    "sadness": max(0.78, all_emotions.get('sadness', 0.5)),
                    "anger": confidence * 0.25,
                    "fear": 0.10,
                    **{k: v * 0.4 for k, v in all_emotions.items() if k not in ["sadness", "anger", "fear"]}
                }
            }
        
        # SMART CORRECTION 2: Anger/Neutral → Fear (clear fear indicators)
        if primary in ["anger", "neutral"] and has_fear and len(text_lower.split()) > 3:
            logger.info(f"Post-processing: Changed {primary} → fear (fear indicators detected)")
            return {
                "primary": "fear",
                "confidence": 0.75,
                "all": {
                    "fear": 0.75,
                    primary: confidence * 0.20,
                    "neutral": 0.05
                }
            }
        
        # SMART CORRECTION 3: Neutral → Joy (clear positive expressions)
        if primary == "neutral" and has_joy and confidence < 0.7:
            logger.info(f"Post-processing: Changed neutral → joy (positive indicators detected)")
            return {
                "primary": "joy",
                "confidence": 0.80,
                "all": {
                    "joy": 0.80,
                    "neutral": 0.15,
                    "surprise": 0.05
                }
            }
        
        # SMART CORRECTION 4: Low confidence with negative context → Sadness
        if confidence < 0.20 and len(text_lower.split()) > 5:
            negative_words = ['not', 'but', 'wrong', 'bad', 'problem', 'issue', 'difficult', 'hard', 'struggle', 'tough']
            negative_count = sum(1 for word in negative_words if word in text_lower)
            
            if negative_count >= 2:
                logger.info(f"Post-processing: Low confidence {confidence:.2f} with {negative_count} negative words, adjusting to sadness")
                return {
                    "primary": "sadness",
                    "confidence": 0.65,
                    "all": {
                        "sadness": 0.65,
                        "neutral": 0.20,
                        "anger": 0.08,
                        "fear": 0.07
                    }
                }
        
        # SMART CORRECTION 5: Mixed emotions (e.g., "I'm happy but worried")
        mixed_emotion_patterns = [
            ("but", "however", "although", "though"),
            ("happy but", "excited but", "glad but"),
            ("sad but", "upset but", "angry but")
        ]
        
        if any(pattern in text_lower for patterns in mixed_emotion_patterns for pattern in patterns):
            # Boost secondary emotion visibility
            if len(all_emotions) > 1:
                sorted_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)
                if len(sorted_emotions) > 1:
                    secondary = sorted_emotions[1][0]
                    secondary_score = sorted_emotions[1][1]
                    
                    # If secondary emotion is significant (>0.2), acknowledge mixed state
                    if secondary_score > 0.20:
                        logger.info(f"Post-processing: Mixed emotions detected - {primary} + {secondary}")
                        return {
                            "primary": primary,
                            "confidence": confidence * 0.85,  # Slight reduction for mixed state
                            "all": all_emotions,
                            "mixed_emotions": True,
                            "secondary": secondary
                        }
        
        return result
    
    async def unload_model(self):
        """Unload the model to free memory."""
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        logger.info("Emotion detection model unloaded")


# Global instance
emotion_service = EmotionService()
