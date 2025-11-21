"""
Quick test of emotion detection using pre-trained model from Hugging Face.
This bypasses training and uses an already fine-tuned model.
"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from loguru import logger

# Use a pre-trained emotion model from Hugging Face
MODEL_NAME = "bhadresh-savani/distilbert-base-uncased-emotion"

# Emotion labels from the model
EMOTION_LABELS = ["sadness", "joy", "love", "anger", "fear", "surprise"]


def predict_emotion(text: str):
    """
    Predict emotion using pre-trained model.
    
    Args:
        text: Input text
        
    Returns:
        Dictionary with emotion predictions
    """
    logger.info(f"Loading model: {MODEL_NAME}")
    
    # Load model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
    
    # Move to GPU if available
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
    
    logger.info(f"Using device: {device}")
    logger.info(f"Analyzing text: '{text}'")
    
    # Tokenize
    inputs = tokenizer(
        text,
        add_special_tokens=True,
        max_length=128,
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
    
    return {
        "text": text,
        "primary_emotion": primary_emotion[0],
        "confidence": primary_emotion[1],
        "all_emotions": emotion_probs,
    }


if __name__ == "__main__":
    import sys
    
    # Get text from command line or use default
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
    else:
        text = "I'm so happy today!"
    
    # Predict
    result = predict_emotion(text)
    
    # Display results
    print(f"\n{'='*60}")
    print(f"Text: {result['text']}")
    print(f"{'='*60}")
    print(f"\n🎯 Primary Emotion: {result['primary_emotion'].upper()}")
    print(f"   Confidence: {result['confidence']:.2%}")
    print(f"\n📊 All Emotion Probabilities:")
    print(f"{'-'*60}")
    
    # Sort by probability
    sorted_emotions = sorted(
        result['all_emotions'].items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    for emotion, prob in sorted_emotions:
        bar_length = int(prob * 50)
        bar = "█" * bar_length
        print(f"   {emotion:12s} {prob:6.2%} |{bar}")
    
    print(f"{'='*60}\n")
