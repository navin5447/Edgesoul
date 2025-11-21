"""
Advanced Emotion Detection Service - EdgeSoul v3.0
Intelligent emotion classification with context awareness and confidence scoring.
"""

import re
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, List, Optional, Tuple
from loguru import logger
import numpy as np
from datetime import datetime


class AdvancedEmotionDetector:
    """
    Next-generation emotion detection with:
    - Context-aware classification
    - Confidence thresholds
    - Intent-based filtering
    - Emotional intensity scoring
    """
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        
        # Emotion mapping with intensity levels
        self.emotion_map = {
            'joy': {'threshold': 0.4, 'intensity_multiplier': 1.2},
            'sadness': {'threshold': 0.3, 'intensity_multiplier': 1.0},
            'anger': {'threshold': 0.5, 'intensity_multiplier': 1.3},
            'fear': {'threshold': 0.3, 'intensity_multiplier': 1.1},
            'surprise': {'threshold': 0.4, 'intensity_multiplier': 0.9},
            'love': {'threshold': 0.3, 'intensity_multiplier': 1.0},
            'neutral': {'threshold': 0.2, 'intensity_multiplier': 0.8}
        }
        
        # Context patterns for better classification
        self.context_patterns = {
            'greeting': [
                r'^(hi|hello|hey|hiya|howdy|good morning|good afternoon|good evening)$',
                r'^(hi|hello|hey)\s*(there|friend|buddy)?[!.]*$',
                r'^(what\'s up|how are you|how\'s it going)[?!.]*$'
            ],
            'question': [
                r'^(what|who|when|where|why|how)\s+',
                r'\?$',
                r'^(can you|could you|would you|will you)',
                r'^(explain|tell me|show me|help me)'
            ],
            'emotional_expression': [
                r'(i\'m|i am|feeling|feel)\s+(so|very|really|extremely)?\s*(happy|sad|angry|scared|excited|worried|frustrated)',
                r'(love|hate|adore|despise)\s+(this|that|it)',
                r'(amazing|terrible|awful|wonderful|fantastic|horrible)',
                r'(makes me|i feel|feeling so)'
            ],
            'practical_request': [
                r'(how to|steps to|way to|process to)',
                r'(change|reset|update|fix|solve|setup)',
                r'(bank|account|upi|pin|payment|card)',
                r'(problem|issue|trouble|error|help with)'
            ]
        }
    
    async def load_model(self):
        """Load the emotion detection model with improved configuration."""
        try:
            logger.info("Loading advanced emotion detection model...")
            
            model_name = "j-hartmann/emotion-english-distilroberta-base"
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            
            # Set to evaluation mode
            self.model.eval()
            
            self.is_loaded = True
            logger.info("✅ Advanced emotion model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load emotion model: {e}")
            raise
    
    def classify_context(self, text: str) -> str:
        """Classify the context/intent of the message."""
        text_lower = text.lower().strip()
        
        # Check each context pattern
        for context, patterns in self.context_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return context
        
        # Default to general if no specific pattern matches
        return 'general'
    
    def calculate_emotional_intensity(self, text: str, emotion: str, confidence: float) -> float:
        """Calculate emotional intensity (0-100) based on text features."""
        intensity_indicators = {
            'high': ['extremely', 'incredibly', 'absolutely', 'completely', 'totally', '!!!', 'so much', 'really really'],
            'medium': ['very', 'quite', 'pretty', 'really', 'definitely', '!!', 'so'],
            'low': ['a bit', 'somewhat', 'kind of', 'sort of', 'maybe', 'slightly']
        }
        
        text_lower = text.lower()
        base_intensity = confidence * 100
        
        # Adjust based on intensity indicators
        for level, indicators in intensity_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    if level == 'high':
                        base_intensity *= 1.4
                    elif level == 'medium':
                        base_intensity *= 1.2
                    elif level == 'low':
                        base_intensity *= 0.8
                    break
        
        # Cap at 100
        return min(100, base_intensity)
    
    async def detect_emotion(self, text: str, context: Optional[str] = None) -> Dict:
        """
        Advanced emotion detection with context awareness.
        
        Returns:
            {
                'primary': str,           # Primary emotion
                'confidence': float,      # Confidence score (0-1)
                'intensity': float,       # Emotional intensity (0-100)
                'context': str,           # Detected context
                'all_emotions': dict,     # All emotion scores
                'is_emotional': bool,     # Whether text is truly emotional
                'reasoning': str          # Why this classification was made
            }
        """
        if not self.is_loaded:
            await self.load_model()
        
        try:
            # Clean and prepare text
            clean_text = text.strip()
            if not clean_text:
                return self._neutral_response("Empty text")
            
            # Classify context first
            detected_context = self.classify_context(clean_text)
            
            # Handle special contexts
            if detected_context == 'greeting':
                return self._create_response('neutral', 0.9, clean_text, detected_context, 
                                           "Greeting detected - classified as neutral")
            
            if detected_context == 'question' and len(clean_text.split()) <= 5:
                return self._create_response('neutral', 0.8, clean_text, detected_context,
                                           "Short question - classified as neutral")
            
            # Run emotion detection
            inputs = self.tokenizer(clean_text, return_tensors="pt", truncation=True, max_length=512)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Get emotion scores
            emotion_scores = predictions[0].numpy()
            emotion_labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
            
            # Create emotion dictionary
            all_emotions = {label: float(score) for label, score in zip(emotion_labels, emotion_scores)}
            
            # Find primary emotion
            primary_emotion = max(all_emotions, key=all_emotions.get)
            confidence = all_emotions[primary_emotion]
            
            # Apply context-based filtering
            filtered_result = self._apply_context_filter(
                primary_emotion, confidence, clean_text, detected_context, all_emotions
            )
            
            return filtered_result
            
        except Exception as e:
            logger.error(f"Error in emotion detection: {e}")
            return self._neutral_response(f"Error: {str(e)}")
    
    def _apply_context_filter(self, emotion: str, confidence: float, text: str, 
                            context: str, all_emotions: dict) -> Dict:
        """Apply context-based filtering to improve accuracy."""
        
        # Get emotion threshold
        threshold = self.emotion_map.get(emotion, {}).get('threshold', 0.4)
        
        # Check if confidence meets threshold
        if confidence < threshold:
            return self._create_response('neutral', 0.7, text, context,
                                       f"Confidence {confidence:.2f} below threshold {threshold}")
        
        # Context-specific filtering
        if context == 'practical_request':
            # Practical requests are usually neutral unless strongly emotional
            if confidence < 0.7:
                return self._create_response('neutral', 0.8, text, context,
                                           "Practical request with low emotional confidence")
        
        if context == 'question' and emotion in ['anger', 'sadness', 'fear']:
            # Questions need higher confidence for negative emotions
            if confidence < 0.6:
                return self._create_response('neutral', 0.7, text, context,
                                           "Question with insufficient negative emotion confidence")
        
        # Check if text actually expresses emotion
        is_emotional = self._is_truly_emotional(text, emotion, confidence)
        
        if not is_emotional and emotion != 'neutral':
            return self._create_response('neutral', 0.6, text, context,
                                       "Text doesn't express clear emotional content")
        
        # Calculate intensity
        intensity = self.calculate_emotional_intensity(text, emotion, confidence)
        
        return self._create_response(emotion, confidence, text, context,
                                   f"Emotion detected with sufficient confidence", 
                                   intensity, all_emotions, is_emotional)
    
    def _is_truly_emotional(self, text: str, emotion: str, confidence: float) -> bool:
        """Determine if text truly expresses emotion vs just mentioning emotional topics."""
        
        text_lower = text.lower()
        
        # Emotional expression indicators
        emotional_expressions = [
            r'(i\'m|i am|feeling|feel)\s+',
            r'(makes me|making me)\s+',
            r'(so|very|really|extremely)\s+(happy|sad|angry|excited|worried|frustrated)',
            r'(love|hate|adore|despise)\s+',
            r'(amazing|terrible|awful|wonderful|fantastic|horrible|brilliant)',
            r'(can\'t believe|unbelievable|shocking|surprising)',
            r'(worried about|scared of|afraid of|anxious about)',
            r'(excited about|thrilled about|happy about|sad about)'
        ]
        
        # Check for emotional expression patterns
        for pattern in emotional_expressions:
            if re.search(pattern, text_lower):
                return True
        
        # Check for exclamation marks (emotional intensity)
        if '!' in text or '!!!' in text:
            return True
        
        # Check for emotional capitalization
        if len([c for c in text if c.isupper()]) > len(text) * 0.3:
            return True
        
        # High confidence emotions are likely real
        if confidence > 0.8:
            return True
        
        return False
    
    def _create_response(self, emotion: str, confidence: float, text: str, 
                        context: str, reasoning: str, intensity: float = None,
                        all_emotions: dict = None, is_emotional: bool = None) -> Dict:
        """Create a standardized emotion response."""
        
        if intensity is None:
            intensity = self.calculate_emotional_intensity(text, emotion, confidence)
        
        if all_emotions is None:
            all_emotions = {emotion: confidence}
        
        if is_emotional is None:
            is_emotional = emotion != 'neutral'
        
        return {
            'primary': emotion,
            'confidence': round(confidence, 3),
            'intensity': round(intensity, 1),
            'context': context,
            'all_emotions': {k: round(v, 3) for k, v in all_emotions.items()},
            'is_emotional': is_emotional,
            'reasoning': reasoning,
            'timestamp': datetime.now().isoformat()
        }
    
    def _neutral_response(self, reason: str) -> Dict:
        """Create a neutral emotion response."""
        return self._create_response('neutral', 0.8, '', 'neutral', reason, 50.0, 
                                   {'neutral': 0.8}, False)


# Global instance
advanced_emotion_detector = AdvancedEmotionDetector()