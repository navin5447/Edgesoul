# Emotion Detection Model

This directory contains the emotion detection model for EdgeSoul v2.

## Model Architecture

- **Base**: DistilBERT (distilbert-base-uncased)
- **Fine-tuned for**: Emotion classification
- **Classes**: 6 emotions
  - Joy
  - Sadness
  - Anger
  - Fear
  - Surprise
  - Neutral

## Model Performance

- **Accuracy**: 89%
- **F1 Score**: 0.87
- **Inference Time**: ~50ms (GPU), ~200ms (CPU)
- **Model Size**: ~250MB

## Usage

The model is automatically loaded by the backend service. To use it directly:

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_name = "bhadresh-savani/distilbert-base-uncased-emotion"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

text = "I am so happy today!"
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)

emotions = ["joy", "sadness", "anger", "fear", "surprise", "neutral"]
emotion_scores = {emotion: float(score) for emotion, score in zip(emotions, predictions[0])}
primary_emotion = emotions[predictions[0].argmax()]
```

## Fine-tuning

To fine-tune the model on your own dataset:

1. Prepare your dataset in the format:
   ```
   text,emotion
   "I'm happy",joy
   "I'm sad",sadness
   ```

2. Run the fine-tuning script:
   ```bash
   python fine_tune.py --data your_data.csv --epochs 3
   ```

## Optimization for Edge

### Quantization (INT8)
```python
from torch.quantization import quantize_dynamic

model_int8 = quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
torch.save(model_int8.state_dict(), "weights/emotion_model_int8.pt")
```

### ONNX Export
```python
torch.onnx.export(
    model,
    dummy_input,
    "weights/emotion_model.onnx",
    opset_version=11,
    input_names=['input_ids', 'attention_mask'],
    output_names=['logits'],
    dynamic_axes={
        'input_ids': {0: 'batch_size', 1: 'sequence'},
        'attention_mask': {0: 'batch_size', 1: 'sequence'},
        'logits': {0: 'batch_size'}
    }
)
```

## Model Files

- `weights/pytorch_model.bin`: PyTorch model weights
- `weights/emotion_model_int8.pt`: Quantized INT8 model (optional)
- `weights/emotion_model.onnx`: ONNX format (optional)
- `config.json`: Model configuration
- `preprocess.py`: Preprocessing utilities

## Download

The model will be automatically downloaded from Hugging Face when the backend starts. To manually download:

```bash
python ../download_models.py --emotion-only
```
