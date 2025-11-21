"""
ONNX Model Converter for DistilBERT Emotion Detection
Converts PyTorch model to ONNX format for faster inference
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
from pathlib import Path

def convert_emotion_model_to_onnx():
    """Convert DistilBERT emotion model to ONNX format"""
    
    print("Starting ONNX conversion...")
    
    # Model and tokenizer
    model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
    
    print(f"Loading model: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    
    # Set model to evaluation mode
    model.eval()
    
    # Create dummy input
    dummy_text = "I am feeling happy today"
    inputs = tokenizer(
        dummy_text,
        padding='max_length',
        truncation=True,
        max_length=128,
        return_tensors="pt"
    )
    
    # Create models directory
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    onnx_path = models_dir / "emotion_model.onnx"
    
    print(f"Converting to ONNX format...")
    print(f"Output path: {onnx_path}")
    
    # Export to ONNX
    torch.onnx.export(
        model,
        (inputs['input_ids'], inputs['attention_mask']),
        str(onnx_path),
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input_ids', 'attention_mask'],
        output_names=['logits'],
        dynamic_axes={
            'input_ids': {0: 'batch_size', 1: 'sequence'},
            'attention_mask': {0: 'batch_size', 1: 'sequence'},
            'logits': {0: 'batch_size'}
        }
    )
    
    print(f"✅ Model successfully converted to ONNX!")
    print(f"✅ Saved to: {onnx_path}")
    print(f"✅ File size: {onnx_path.stat().st_size / 1024 / 1024:.2f} MB")
    
    # Save tokenizer
    tokenizer_path = models_dir / "tokenizer"
    tokenizer.save_pretrained(str(tokenizer_path))
    print(f"✅ Tokenizer saved to: {tokenizer_path}")
    
    # Save label mapping
    labels_path = models_dir / "labels.txt"
    labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
    with open(labels_path, 'w') as f:
        f.write('\n'.join(labels))
    print(f"✅ Labels saved to: {labels_path}")
    
    return str(onnx_path)

def test_onnx_model(onnx_path: str):
    """Test the ONNX model inference"""
    try:
        import onnxruntime as ort
        import numpy as np
        from transformers import AutoTokenizer
        
        print("\n" + "="*50)
        print("Testing ONNX Model")
        print("="*50)
        
        # Load tokenizer
        model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # Create ONNX session
        session = ort.InferenceSession(onnx_path)
        
        # Test texts
        test_texts = [
            "I am so happy today!",
            "This makes me really angry",
            "I'm feeling very sad",
            "I love this so much!",
            "This is scary",
            "Wow, that's surprising!"
        ]
        
        labels = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise']
        
        print("\nRunning inference on test texts:\n")
        
        for text in test_texts:
            # Tokenize
            inputs = tokenizer(
                text,
                padding='max_length',
                truncation=True,
                max_length=128,
                return_tensors="np"
            )
            
            # Run inference
            outputs = session.run(
                ['logits'],
                {
                    'input_ids': inputs['input_ids'].astype(np.int64),
                    'attention_mask': inputs['attention_mask'].astype(np.int64)
                }
            )
            
            # Get prediction
            logits = outputs[0][0]
            probabilities = np.exp(logits) / np.sum(np.exp(logits))
            predicted_idx = np.argmax(probabilities)
            predicted_emotion = labels[predicted_idx]
            confidence = probabilities[predicted_idx]
            
            print(f"Text: '{text}'")
            print(f"Emotion: {predicted_emotion} (confidence: {confidence:.2%})")
            print()
        
        print("✅ ONNX model test completed successfully!")
        
    except ImportError:
        print("⚠️  onnxruntime not installed. Install it with: pip install onnxruntime")
        print("   Skipping ONNX model testing...")
    except Exception as e:
        print(f"❌ Error testing ONNX model: {e}")

if __name__ == "__main__":
    print("="*60)
    print("ONNX Model Conversion Tool")
    print("="*60)
    print()
    
    try:
        # Convert model
        onnx_path = convert_emotion_model_to_onnx()
        
        # Test model
        test_onnx_model(onnx_path)
        
        print("\n" + "="*60)
        print("Conversion Complete!")
        print("="*60)
        print("\nNext steps:")
        print("1. Install onnxruntime: pip install onnxruntime")
        print("2. Update emotion_service.py to use ONNX model")
        print("3. Enjoy faster inference!")
        
    except Exception as e:
        print(f"\n❌ Error during conversion: {e}")
        import traceback
        traceback.print_exc()
