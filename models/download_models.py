"""
Script to download pre-trained models for EdgeSoul v2.

Usage:
    python download_models.py --all
    python download_models.py --emotion-only
    python download_models.py --knowledge-only
    python download_models.py --knowledge-model tinyllama
"""

import argparse
import os
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoModelForCausalLM
from loguru import logger


def download_emotion_model(output_dir: str = "./emotion/weights"):
    """Download emotion detection model."""
    logger.info("Downloading emotion detection model...")
    
    model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
    
    try:
        # Create output directory
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Download tokenizer and model
        logger.info(f"Downloading from Hugging Face: {model_name}")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        
        # Save to local directory
        tokenizer.save_pretrained(output_dir)
        model.save_pretrained(output_dir)
        
        logger.info(f"✓ Emotion model downloaded to {output_dir}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to download emotion model: {str(e)}")
        return False


def download_knowledge_model(model_choice: str = "tinyllama", output_dir: str = "./knowledge/weights"):
    """Download knowledge reasoning model."""
    logger.info(f"Downloading knowledge model: {model_choice}")
    
    model_mapping = {
        "gpt2": "gpt2",
        "tinyllama": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        "llama2": "meta-llama/Llama-2-7b-chat-hf",
    }
    
    if model_choice not in model_mapping:
        logger.error(f"Unknown model: {model_choice}. Choose from: {list(model_mapping.keys())}")
        return False
    
    model_name = model_mapping[model_choice]
    
    try:
        # Create output directory
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Download tokenizer and model
        logger.info(f"Downloading from Hugging Face: {model_name}")
        logger.warning(f"This may take several minutes depending on model size...")
        
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
        
        # Save to local directory
        tokenizer.save_pretrained(output_dir)
        model.save_pretrained(output_dir)
        
        logger.info(f"✓ Knowledge model downloaded to {output_dir}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to download knowledge model: {str(e)}")
        if "llama" in model_choice.lower():
            logger.info("Note: Llama models require authentication. Run: huggingface-cli login")
        return False


def main():
    parser = argparse.ArgumentParser(description="Download EdgeSoul v2 AI models")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Download all models (emotion + knowledge)"
    )
    parser.add_argument(
        "--emotion-only",
        action="store_true",
        help="Download only emotion detection model"
    )
    parser.add_argument(
        "--knowledge-only",
        action="store_true",
        help="Download only knowledge reasoning model"
    )
    parser.add_argument(
        "--knowledge-model",
        type=str,
        default="tinyllama",
        choices=["gpt2", "tinyllama", "llama2"],
        help="Choose knowledge model (default: tinyllama)"
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 50)
    logger.info("EdgeSoul v2 - Model Downloader")
    logger.info("=" * 50)
    
    success = True
    
    # Download emotion model
    if args.all or args.emotion_only:
        success = download_emotion_model() and success
    
    # Download knowledge model
    if args.all or args.knowledge_only or (not args.emotion_only):
        success = download_knowledge_model(args.knowledge_model) and success
    
    logger.info("=" * 50)
    if success:
        logger.info("✓ All models downloaded successfully!")
        logger.info("\nNext steps:")
        logger.info("1. Start the backend: cd backend && uvicorn main:app --reload")
        logger.info("2. Start the frontend: cd frontend && npm run dev")
    else:
        logger.error("✗ Some models failed to download. Check the errors above.")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
