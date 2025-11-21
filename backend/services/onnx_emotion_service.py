"""
ONNX-based Emotion Service - Faster Inference
Uses ONNX Runtime instead of PyTorch for 2-3x speed improvement
"""

import numpy as np
from typing import Dict, List
from loguru import logger
from pathlib import Path

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    logger.warning("onnxruntime not available, falling back to PyTorch")

from transformers import AutoTokenizer


class ONNXEmotionService:
    """ONNX-based emotion detection service"""
    
    def __init__(self, model_path: str = "models/emotion_model.onnx"):
        self.model_path = Path(model_path)
        self.labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
        
        if not ONNX_AVAILABLE:
            raise ImportError("onnxruntime is required. Install with: pip install onnxruntime")
        
        if not self.model_path.exists():
            raise FileNotFoundError(f"ONNX model not found at {self.model_path}. Run convert_to_onnx.py first.")
        
        # Load ONNX model
        logger.info(f"Loading ONNX emotion model from {self.model_path}")
        self.session = ort.InferenceSession(str(self.model_path))
        
        # Load tokenizer
        tokenizer_path = self.model_path.parent / "tokenizer"
        if tokenizer_path.exists():
            self.tokenizer = AutoTokenizer.from_pretrained(str(tokenizer_path))
        else:
            # Fallback to downloading tokenizer
            logger.info("Loading tokenizer from HuggingFace")
            self.tokenizer = AutoTokenizer.from_pretrained(
                "bhadresh-savani/distilbert-base-uncased-emotion"
            )
        
        logger.info("✅ ONNX Emotion Service initialized successfully")
    
    async def detect_emotion(self, text: str) -> Dict:
        """
        Detect emotion using ONNX model
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dict with emotion, confidence, and all emotions
        """
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                padding='max_length',
                truncation=True,
                max_length=128,
                return_tensors="np"
            )
            
            # Run ONNX inference
            outputs = self.session.run(
                ['logits'],
                {
                    'input_ids': inputs['input_ids'].astype(np.int64),
                    'attention_mask': inputs['attention_mask'].astype(np.int64)
                }
            )
            
            # Process results
            logits = outputs[0][0]
            probabilities = self._softmax(logits)
            
            # Get all emotions with probabilities
            all_emotions = {
                label: float(prob)
                for label, prob in zip(self.labels, probabilities)
            }
            
            # Get primary emotion
            predicted_idx = np.argmax(probabilities)
            primary_emotion = self.labels[predicted_idx]
            confidence = float(probabilities[predicted_idx])
            
            return {
                'primary': primary_emotion,
                'confidence': confidence,
                'all': all_emotions
            }
            
        except Exception as e:
            logger.error(f"Error in ONNX emotion detection: {e}")
            return {
                'primary': 'neutral',
                'confidence': 0.5,
                'all': {'neutral': 0.5}
            }
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """Compute softmax values"""
        exp_x = np.exp(x - np.max(x))
        return exp_x / exp_x.sum()
    
    def get_model_info(self) -> Dict:
        """Get information about the loaded model"""
        return {
            'model_path': str(self.model_path),
            'model_type': 'ONNX',
            'labels': self.labels,
            'runtime': 'ONNX Runtime',
            'input_max_length': 128
        }


# Create singleton instance
try:
    onnx_emotion_service = ONNXEmotionService()
    logger.info("Using ONNX Emotion Service (faster inference)")
except Exception as e:
    logger.warning(f"Failed to load ONNX model: {e}")
    logger.info("Falling back to PyTorch emotion service")
    onnx_emotion_service = None
