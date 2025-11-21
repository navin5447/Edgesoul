"""
Simple Emotion Model Training Script (No Trainer API)

This script trains a DistilBERT model without using the Trainer API
to avoid version compatibility issues.

Usage:
    python simple_emotion_train.py
"""

import os
import json
from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    AdamW,
    get_linear_schedule_with_warmup
)
from datasets import load_dataset
from sklearn.metrics import accuracy_score, classification_report
from tqdm import tqdm
from loguru import logger

# Configuration
MODEL_NAME = "distilbert-base-uncased"
MAX_LENGTH = 128
BATCH_SIZE = 16
LEARNING_RATE = 2e-5
NUM_EPOCHS = 3
SAVE_DIR = "../models/emotion/weights"
CONFIG_PATH = "../models/emotion/config.json"

# Emotion mapping
EMOTION_MAPPING = {
    "joyful": "joy", "excited": "joy", "proud": "joy", "grateful": "joy",
    "content": "joy", "hopeful": "joy", "confident": "joy", "caring": "joy",
    "sad": "sadness", "lonely": "sadness", "disappointed": "sadness",
    "ashamed": "sadness", "guilty": "sadness", "devastated": "sadness",
    "angry": "anger", "annoyed": "anger", "furious": "anger",
    "jealous": "anger", "disgusted": "anger",
    "afraid": "fear", "terrified": "fear", "anxious": "fear",
    "apprehensive": "fear", "nervous": "fear",
    "surprised": "surprise", "impressed": "surprise",
    "neutral": "neutral", "embarrassed": "neutral", "anticipating": "neutral",
    "nostalgic": "neutral", "prepared": "neutral", "trusting": "neutral", "faithful": "neutral",
}

EMOTION_LABELS = ["joy", "sadness", "anger", "fear", "surprise", "neutral"]
LABEL2ID = {label: idx for idx, label in enumerate(EMOTION_LABELS)}
ID2LABEL = {idx: label for label, idx in LABEL2ID.items()}


def prepare_data(tokenizer):
    """Load and prepare dataset."""
    logger.info("Loading empathetic_dialogues dataset...")
    
    try:
        dataset = load_dataset("empathetic_dialogues", trust_remote_code=True)
        
        def process_data(split_data):
            texts = []
            labels = []
            
            for item in split_data:
                text = item.get("utterance", "")
                emotion = item.get("context", "")
                
                if emotion in EMOTION_MAPPING:
                    mapped_emotion = EMOTION_MAPPING[emotion]
                    label = LABEL2ID[mapped_emotion]
                    texts.append(text)
                    labels.append(label)
            
            return texts, labels
        
        train_texts, train_labels = process_data(dataset["train"])
        val_texts, val_labels = process_data(dataset["validation"])
        test_texts, test_labels = process_data(dataset["test"])
        
        logger.info(f"Train: {len(train_texts)}, Val: {len(val_texts)}, Test: {len(test_texts)}")
        
        # Tokenize
        train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=MAX_LENGTH)
        val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=MAX_LENGTH)
        test_encodings = tokenizer(test_texts, truncation=True, padding=True, max_length=MAX_LENGTH)
        
        return (train_encodings, train_labels), (val_encodings, val_labels), (test_encodings, test_labels)
    
    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        raise


class EmotionDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)


def train_epoch(model, dataloader, optimizer, scheduler, device):
    """Train for one epoch."""
    model.train()
    total_loss = 0
    predictions = []
    true_labels = []
    
    progress_bar = tqdm(dataloader, desc="Training")
    
    for batch in progress_bar:
        optimizer.zero_grad()
        
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()
        
        total_loss += loss.item()
        
        preds = torch.argmax(outputs.logits, dim=1)
        predictions.extend(preds.cpu().numpy())
        true_labels.extend(labels.cpu().numpy())
        
        progress_bar.set_postfix({'loss': loss.item()})
    
    avg_loss = total_loss / len(dataloader)
    accuracy = accuracy_score(true_labels, predictions)
    
    return avg_loss, accuracy


def evaluate(model, dataloader, device):
    """Evaluate the model."""
    model.eval()
    total_loss = 0
    predictions = []
    true_labels = []
    
    with torch.no_grad():
        for batch in tqdm(dataloader, desc="Evaluating"):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            
            total_loss += loss.item()
            
            preds = torch.argmax(outputs.logits, dim=1)
            predictions.extend(preds.cpu().numpy())
            true_labels.extend(labels.cpu().numpy())
    
    avg_loss = total_loss / len(dataloader)
    accuracy = accuracy_score(true_labels, predictions)
    
    return avg_loss, accuracy, predictions, true_labels


def main():
    logger.info("="*60)
    logger.info("Starting Emotion Model Training")
    logger.info("="*60)
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Using device: {device}")
    
    # Load tokenizer
    logger.info(f"Loading tokenizer: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    # Prepare data
    (train_encodings, train_labels), (val_encodings, val_labels), (test_encodings, test_labels) = prepare_data(tokenizer)
    
    # Create datasets
    train_dataset = EmotionDataset(train_encodings, train_labels)
    val_dataset = EmotionDataset(val_encodings, val_labels)
    test_dataset = EmotionDataset(test_encodings, test_labels)
    
    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)
    
    # Load model
    logger.info(f"Loading model: {MODEL_NAME}")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(EMOTION_LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )
    model.to(device)
    
    # Setup optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
    total_steps = len(train_loader) * NUM_EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=500,
        num_training_steps=total_steps
    )
    
    # Training loop
    best_val_acc = 0
    
    for epoch in range(NUM_EPOCHS):
        logger.info(f"\nEpoch {epoch + 1}/{NUM_EPOCHS}")
        logger.info("-" * 60)
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, scheduler, device)
        logger.info(f"Train Loss: {train_loss:.4f}, Train Accuracy: {train_acc:.4f}")
        
        # Validate
        val_loss, val_acc, _, _ = evaluate(model, val_loader, device)
        logger.info(f"Val Loss: {val_loss:.4f}, Val Accuracy: {val_acc:.4f}")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            logger.info(f"New best model! Saving to {SAVE_DIR}")
            
            Path(SAVE_DIR).mkdir(parents=True, exist_ok=True)
            model.save_pretrained(SAVE_DIR)
            tokenizer.save_pretrained(SAVE_DIR)
    
    # Final evaluation on test set
    logger.info("\n" + "="*60)
    logger.info("Final Evaluation on Test Set")
    logger.info("="*60)
    
    test_loss, test_acc, predictions, true_labels = evaluate(model, test_loader, device)
    logger.info(f"Test Loss: {test_loss:.4f}, Test Accuracy: {test_acc:.4f}")
    
    # Classification report
    report = classification_report(true_labels, predictions, target_names=EMOTION_LABELS)
    logger.info("\nClassification Report:")
    logger.info("\n" + report)
    
    # Save config
    config = {
        "model_name": MODEL_NAME,
        "num_labels": len(EMOTION_LABELS),
        "labels": EMOTION_LABELS,
        "label2id": LABEL2ID,
        "id2label": {str(k): v for k, v in ID2LABEL.items()},
        "max_length": MAX_LENGTH,
        "test_accuracy": test_acc,
    }
    
    config_file = Path(CONFIG_PATH)
    config_file.parent.mkdir(parents=True, exist_ok=True)
    with open(config_file, "w") as f:
        json.dump(config, f, indent=2)
    
    logger.info(f"\nTraining complete! Model saved to {SAVE_DIR}")
    logger.info(f"Config saved to {CONFIG_PATH}")


if __name__ == "__main__":
    main()
