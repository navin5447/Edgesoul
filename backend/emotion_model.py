"""
Emotion Detection Model Training Script

This script trains a DistilBERT model on the empathetic_dialogues dataset
from Hugging Face for emotion classification.

Emotions: joy, anger, sadness, fear, surprise, neutral

Usage:
    python emotion_model.py --train
    python emotion_model.py --evaluate
    python emotion_model.py --predict "I'm so happy today!"
"""

import argparse
import os
import json
from typing import Dict, List, Tuple
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader, Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)
from datasets import load_dataset
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
from loguru import logger


# Configuration
MODEL_NAME = "distilbert-base-uncased"  # Can also use "bert-base-uncased"
MAX_LENGTH = 128
BATCH_SIZE = 16
LEARNING_RATE = 2e-5
NUM_EPOCHS = 3
SAVE_DIR = "../models/emotion/weights"
CONFIG_PATH = "../models/emotion/config.json"

# Emotion mapping - map empathetic_dialogues emotions to our categories
EMOTION_MAPPING = {
    # Joy-related
    "joyful": "joy",
    "excited": "joy",
    "proud": "joy",
    "grateful": "joy",
    "content": "joy",
    "hopeful": "joy",
    "confident": "joy",
    "caring": "joy",
    
    # Sadness-related
    "sad": "sadness",
    "lonely": "sadness",
    "disappointed": "sadness",
    "ashamed": "sadness",
    "guilty": "sadness",
    "devastated": "sadness",
    
    # Anger-related
    "angry": "anger",
    "annoyed": "anger",
    "furious": "anger",
    "jealous": "anger",
    "disgusted": "anger",
    
    # Fear-related
    "afraid": "fear",
    "terrified": "fear",
    "anxious": "fear",
    "apprehensive": "fear",
    "nervous": "fear",
    
    # Surprise-related
    "surprised": "surprise",
    "impressed": "surprise",
    
    # Neutral-related
    "neutral": "neutral",
    "embarrassed": "neutral",
    "anticipating": "neutral",
    "nostalgic": "neutral",
    "prepared": "neutral",
    "trusting": "neutral",
    "faithful": "neutral",
}

# Final emotion labels
EMOTION_LABELS = ["joy", "sadness", "anger", "fear", "surprise", "neutral"]
LABEL2ID = {label: idx for idx, label in enumerate(EMOTION_LABELS)}
ID2LABEL = {idx: label for label, idx in LABEL2ID.items()}


class EmotionDataset(Dataset):
    """Custom dataset for emotion classification."""
    
    def __init__(self, texts: List[str], labels: List[int], tokenizer, max_length: int = 128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_attention_mask=True,
            return_tensors="pt",
        )
        
        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": torch.tensor(label, dtype=torch.long),
        }


def load_and_prepare_data() -> Tuple[Dataset, Dataset, Dataset]:
    """
    Load empathetic_dialogues dataset and prepare for training.
    
    Returns:
        Tuple of (train_dataset, val_dataset, test_dataset)
    """
    logger.info("Loading empathetic_dialogues dataset from Hugging Face...")
    
    try:
        # Load the dataset
        dataset = load_dataset("empathetic_dialogues")
        
        logger.info(f"Dataset loaded. Train size: {len(dataset['train'])}, "
                   f"Valid size: {len(dataset['validation'])}, "
                   f"Test size: {len(dataset['test'])}")
        
        # Initialize tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        
        def prepare_split(split_data):
            """Prepare a dataset split."""
            texts = []
            labels = []
            skipped = 0
            
            for item in split_data:
                # Get the utterance text
                text = item.get("utterance", "")
                # Get the emotion context
                emotion = item.get("context", "")
                
                # Map emotion to our categories
                if emotion in EMOTION_MAPPING:
                    mapped_emotion = EMOTION_MAPPING[emotion]
                    label = LABEL2ID[mapped_emotion]
                    
                    texts.append(text)
                    labels.append(label)
                else:
                    skipped += 1
            
            logger.info(f"Prepared {len(texts)} samples, skipped {skipped} unknown emotions")
            return EmotionDataset(texts, labels, tokenizer, MAX_LENGTH)
        
        # Prepare splits
        train_dataset = prepare_split(dataset["train"])
        val_dataset = prepare_split(dataset["validation"])
        test_dataset = prepare_split(dataset["test"])
        
        return train_dataset, val_dataset, test_dataset
    
    except Exception as e:
        logger.error(f"Error loading dataset: {str(e)}")
        logger.info("Falling back to synthetic data for demonstration...")
        return create_synthetic_data()


def create_synthetic_data() -> Tuple[Dataset, Dataset, Dataset]:
    """Create synthetic data for testing when dataset is unavailable."""
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    # Synthetic training data
    train_texts = [
        "I'm so happy today!", "This is amazing!", "I feel great!",
        "I'm really angry right now", "This makes me furious", "I'm so annoyed",
        "I feel so sad", "This is devastating", "I'm heartbroken",
        "I'm scared", "This is terrifying", "I feel anxious",
        "Wow, I didn't expect that!", "That's surprising!", "I'm amazed",
        "Just another day", "It's okay", "Nothing special",
    ] * 50  # Repeat to have more samples
    
    train_labels = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5] * 50
    
    val_texts = train_texts[:100]
    val_labels = train_labels[:100]
    
    test_texts = train_texts[:50]
    test_labels = train_labels[:50]
    
    train_dataset = EmotionDataset(train_texts, train_labels, tokenizer, MAX_LENGTH)
    val_dataset = EmotionDataset(val_texts, val_labels, tokenizer, MAX_LENGTH)
    test_dataset = EmotionDataset(test_texts, test_labels, tokenizer, MAX_LENGTH)
    
    logger.info(f"Created synthetic dataset - Train: {len(train_dataset)}, "
                f"Val: {len(val_dataset)}, Test: {len(test_dataset)}")
    
    return train_dataset, val_dataset, test_dataset


def compute_metrics(pred):
    """Compute metrics for evaluation."""
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="weighted", zero_division=0
    )
    acc = accuracy_score(labels, preds)
    
    return {
        "accuracy": acc,
        "f1": f1,
        "precision": precision,
        "recall": recall,
    }


def train_model(train_dataset: Dataset, val_dataset: Dataset, output_dir: str = SAVE_DIR):
    """
    Train the emotion detection model.
    
    Args:
        train_dataset: Training dataset
        val_dataset: Validation dataset
        output_dir: Directory to save the model
    """
    logger.info("Initializing model for training...")
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Initialize model
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(EMOTION_LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=NUM_EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir=f"{output_dir}/logs",
        logging_steps=100,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        greater_is_better=True,
        save_total_limit=2,
        learning_rate=LEARNING_RATE,
        fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
    )
    
    # Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    )
    
    # Train
    logger.info("Starting training...")
    trainer.train()
    
    # Save the model
    logger.info(f"Saving model to {output_dir}...")
    trainer.save_model(output_dir)
    
    # Save tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.save_pretrained(output_dir)
    
    # Save configuration
    config = {
        "model_name": MODEL_NAME,
        "num_labels": len(EMOTION_LABELS),
        "labels": EMOTION_LABELS,
        "label2id": LABEL2ID,
        "id2label": {str(k): v for k, v in ID2LABEL.items()},
        "max_length": MAX_LENGTH,
        "training": {
            "batch_size": BATCH_SIZE,
            "learning_rate": LEARNING_RATE,
            "num_epochs": NUM_EPOCHS,
        }
    }
    
    config_file = Path(CONFIG_PATH)
    config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(config_file, "w") as f:
        json.dump(config, f, indent=2)
    
    logger.info("Training complete!")
    return trainer


def evaluate_model(test_dataset: Dataset, model_dir: str = SAVE_DIR):
    """
    Evaluate the trained model.
    
    Args:
        test_dataset: Test dataset
        model_dir: Directory containing the saved model
    """
    logger.info(f"Loading model from {model_dir}...")
    
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    
    # Create trainer for evaluation
    trainer = Trainer(
        model=model,
        compute_metrics=compute_metrics,
    )
    
    # Evaluate
    logger.info("Evaluating model...")
    results = trainer.evaluate(test_dataset)
    
    logger.info("Evaluation Results:")
    for key, value in results.items():
        logger.info(f"  {key}: {value:.4f}")
    
    # Detailed classification report
    predictions = trainer.predict(test_dataset)
    preds = predictions.predictions.argmax(-1)
    labels = predictions.label_ids
    
    report = classification_report(
        labels,
        preds,
        target_names=EMOTION_LABELS,
        zero_division=0
    )
    
    logger.info("\nDetailed Classification Report:")
    logger.info("\n" + report)
    
    return results


def predict_emotion(text: str, model_dir: str = SAVE_DIR) -> Dict[str, float]:
    """
    Predict emotion for a given text.
    
    Args:
        text: Input text
        model_dir: Directory containing the saved model
        
    Returns:
        Dictionary with emotion probabilities
    """
    # Load model and tokenizer
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    
    # Move to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
    
    # Tokenize
    inputs = tokenizer(
        text,
        add_special_tokens=True,
        max_length=MAX_LENGTH,
        padding="max_length",
        truncation=True,
        return_attention_mask=True,
        return_tensors="pt",
    )
    
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Predict
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=-1)
    
    # Convert to dictionary
    probs = probabilities.cpu().numpy()[0]
    emotion_probs = {
        emotion: float(prob)
        for emotion, prob in zip(EMOTION_LABELS, probs)
    }
    
    # Get primary emotion
    primary_emotion = max(emotion_probs.items(), key=lambda x: x[1])
    
    result = {
        "text": text,
        "primary_emotion": primary_emotion[0],
        "confidence": primary_emotion[1],
        "all_emotions": emotion_probs,
    }
    
    return result


def predict_batch(texts: List[str], model_dir: str = SAVE_DIR) -> List[Dict[str, float]]:
    """
    Predict emotions for multiple texts.
    
    Args:
        texts: List of input texts
        model_dir: Directory containing the saved model
        
    Returns:
        List of prediction dictionaries
    """
    results = []
    for text in texts:
        result = predict_emotion(text, model_dir)
        results.append(result)
    return results


def main():
    """Main function to handle command-line interface."""
    parser = argparse.ArgumentParser(description="Emotion Detection Model Training")
    parser.add_argument(
        "--train",
        action="store_true",
        help="Train the model"
    )
    parser.add_argument(
        "--evaluate",
        action="store_true",
        help="Evaluate the model"
    )
    parser.add_argument(
        "--predict",
        type=str,
        help="Predict emotion for given text"
    )
    parser.add_argument(
        "--model-name",
        type=str,
        default="distilbert-base-uncased",
        help="Base model to use (default: distilbert-base-uncased)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=3,
        help="Number of training epochs"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Batch size for training"
    )
    
    args = parser.parse_args()
    
    if args.train:
        logger.info("=== Training Emotion Detection Model ===")
        
        # Update configuration if specified
        model_name = args.model_name
        num_epochs = args.epochs
        batch_size = args.batch_size
        
        # Load data
        train_dataset, val_dataset, test_dataset = load_and_prepare_data()
        
        # Train
        trainer = train_model(train_dataset, val_dataset)
        
        # Evaluate on test set
        logger.info("\n=== Evaluating on Test Set ===")
        evaluate_model(test_dataset)
        
    elif args.evaluate:
        logger.info("=== Evaluating Emotion Detection Model ===")
        _, _, test_dataset = load_and_prepare_data()
        evaluate_model(test_dataset)
        
    elif args.predict:
        logger.info(f"=== Predicting Emotion ===")
        result = predict_emotion(args.predict)
        
        print(f"\nText: {result['text']}")
        print(f"Primary Emotion: {result['primary_emotion']} ({result['confidence']:.2%})")
        print("\nAll Emotions:")
        for emotion, prob in sorted(result['all_emotions'].items(), key=lambda x: x[1], reverse=True):
            print(f"  {emotion}: {prob:.2%}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
