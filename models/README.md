# AI Models for EdgeSoul v2

This directory contains the AI models used by EdgeSoul v2 for emotion detection and knowledge reasoning.

## Structure

```
models/
├── emotion/              # Emotion detection model
│   ├── weights/         # Model weights and checkpoints
│   ├── config.json      # Model configuration
│   ├── preprocess.py    # Preprocessing utilities
│   └── README.md        # Emotion model documentation
├── knowledge/           # Knowledge reasoning model (LLM)
│   ├── weights/         # Model weights and checkpoints
│   ├── config.json      # Model configuration
│   ├── prompts/         # Prompt templates
│   └── README.md        # Knowledge model documentation
└── download_models.py   # Script to download pre-trained models
```

## Downloading Models

To download the pre-trained models, run:

```bash
python download_models.py
```

This will download:
1. Emotion detection model (DistilBERT fine-tuned on emotions)
2. Knowledge reasoning model (GPT-2 or Llama 2)

## Model Details

### Emotion Detection

- **Base Model**: DistilBERT
- **Fine-tuned on**: Emotion classification dataset
- **Output**: 6 emotions (joy, sadness, anger, fear, surprise, neutral)
- **Size**: ~250MB

### Knowledge Reasoning

- **Options**:
  - **Local**: GPT-2 (774MB) or Llama 2 (13GB for 7B model)
  - **API**: OpenAI GPT-3.5/4, Anthropic Claude
- **Purpose**: General conversation and knowledge-based responses

## Custom Models

To use your own models:

1. Place model weights in the respective `weights/` directory
2. Update `config.json` with model specifications
3. Update the backend configuration in `backend/.env`

## Model Size Considerations

For edge deployment, consider:
- **Emotion Model**: ~250MB (optimized for edge)
- **Knowledge Model**: 
  - GPT-2: 774MB (edge-friendly)
  - Llama 2 7B: ~13GB (requires powerful edge device)
  - TinyLlama: ~1.1GB (recommended for edge)
  - API-based: No local storage needed

## Optimization

Models can be optimized for edge deployment:
- Quantization (INT8/INT4)
- Pruning
- ONNX conversion
- TensorRT optimization

See individual model READMEs for optimization instructions.
