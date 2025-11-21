"""Preprocessing utilities for emotion detection."""

import re
from typing import List, Dict
import torch
from transformers import AutoTokenizer


class EmotionPreprocessor:
    """Preprocessor for emotion detection model."""
    
    def __init__(self, tokenizer_name: str = "distilbert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
        self.max_length = 512
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text for emotion detection.
        
        Args:
            text: Raw input text
            
        Returns:
            Preprocessed text
        """
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove mentions and hashtags (optional - may contain emotional context)
        # text = re.sub(r'@\w+', '', text)
        # text = re.sub(r'#\w+', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Convert to lowercase (handled by tokenizer for BERT models)
        # text = text.lower()
        
        return text.strip()
    
    def tokenize(
        self,
        text: str,
        max_length: int = None,
        padding: bool = True,
        truncation: bool = True,
    ) -> Dict[str, torch.Tensor]:
        """
        Tokenize text for model input.
        
        Args:
            text: Preprocessed text
            max_length: Maximum sequence length
            padding: Whether to pad sequences
            truncation: Whether to truncate sequences
            
        Returns:
            Tokenized inputs ready for model
        """
        max_length = max_length or self.max_length
        
        inputs = self.tokenizer(
            text,
            max_length=max_length,
            padding=padding,
            truncation=truncation,
            return_tensors="pt",
        )
        
        return inputs
    
    def preprocess_batch(
        self,
        texts: List[str],
        max_length: int = None,
    ) -> Dict[str, torch.Tensor]:
        """
        Preprocess and tokenize a batch of texts.
        
        Args:
            texts: List of raw texts
            max_length: Maximum sequence length
            
        Returns:
            Batch of tokenized inputs
        """
        # Preprocess all texts
        preprocessed = [self.preprocess_text(text) for text in texts]
        
        # Tokenize batch
        max_length = max_length or self.max_length
        
        inputs = self.tokenizer(
            preprocessed,
            max_length=max_length,
            padding=True,
            truncation=True,
            return_tensors="pt",
        )
        
        return inputs


def load_preprocessor(config_path: str = None) -> EmotionPreprocessor:
    """
    Load preprocessor from config.
    
    Args:
        config_path: Path to config.json
        
    Returns:
        EmotionPreprocessor instance
    """
    if config_path:
        import json
        with open(config_path, 'r') as f:
            config = json.load(f)
        tokenizer_name = config.get("preprocessing", {}).get("tokenizer", "distilbert-base-uncased")
    else:
        tokenizer_name = "distilbert-base-uncased"
    
    return EmotionPreprocessor(tokenizer_name)
