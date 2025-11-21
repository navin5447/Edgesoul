# EdgeSoul Backend

FastAPI backend with emotional intelligence and knowledge reasoning.

## Architecture

```
backend/
├── api/v1/              # REST API endpoints
├── services/            # Business logic
│   ├── emotion_service.py          # ONNX emotion detection
│   ├── knowledge_engine.py         # Ollama integration  
│   ├── intelligent_reply_engine.py # Smart response routing
│   ├── chat_service.py             # Main chat orchestration
│   └── hybrid_chat_engine.py       # Emotion + Knowledge hybrid
├── models/              # Pydantic data models
├── core/                # Configuration
└── main.py              # FastAPI app
```

## Features

- **Emotion Detection**: 85%+ accuracy with ONNX model
- **Knowledge Engine**: Local LLM via Ollama (TinyLlama/Phi3/Llama)
- **Intelligent Routing**: Detects intent and routes appropriately
- **Hybrid Responses**: Combines emotional support + factual knowledge
- **Memory Service**: User preferences and conversation context

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
python -m uvicorn main:app --reload --port 8000

# Access API docs
# http://localhost:8000/docs
```

## Configuration

**File**: `core/config.py`

```python
ENABLE_EMOTION_DETECTION = True
ENABLE_KNOWLEDGE_REASONING = True  
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL = "tinyllama"
EMOTION_MODEL_PATH = "../models/emotion_model.onnx"
```

## API Endpoints

### POST `/api/v1/chat`
Process chat message

**Request:**
```json
{
  "message": "I'm feeling sad",
  "session_id": "user123",
  "use_hybrid": true
}
```

**Response:**
```json
{
  "message": "I hear you...",
  "emotion": {
    "primary": "sadness",
    "confidence": 0.87
  },
  "session_id": "user123"
}
```

### GET `/api/v1/health`
Check backend health

### GET `/api/v1/models/status`
Check Ollama model status

## Services

### Emotion Service
- Detects 6 emotions: joy, sadness, anger, fear, love, surprise
- ONNX-based for fast inference
- Post-processing for context awareness

### Knowledge Engine  
- Integrates with Ollama
- Supports multiple models
- Temperature and token control

### Intelligent Reply Engine
- Detects user intent
- Routes to emotional support or knowledge
- Context-aware responses

## Testing

```bash
# Quick emotion test
python test_emotion_quick.py

# Test Ollama
python test_ollama_working.py

# Test complete system
python test_complete_system.py
```

## Model Switching

```bash
python switch_model.py tiny    # TinyLlama
python switch_model.py phi3    # Phi3
python switch_model.py llama3  # Llama 3.2
```

## Environment Variables

Create `.env` file:

```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=tinyllama
ENABLE_EMOTION_DETECTION=true
ENABLE_KNOWLEDGE_REASONING=true
```

## Dependencies

- FastAPI - Web framework
- Pydantic - Data validation
- ONNX Runtime - Emotion model inference
- httpx - Ollama API client
- loguru - Logging

See `requirements.txt` for complete list.

## Development

```bash
# Run with auto-reload
uvicorn main:app --reload --port 8000

# Run tests
pytest

# Format code
black .

# Type checking
mypy .
```

## Troubleshooting

**"Ollama not found"**
```bash
ollama serve
```

**"Emotion model not found"**
- Model is at `../models/emotion_model.onnx`
- Check path in `core/config.py`

**Slow responses**
- Switch to lighter model: `python switch_model.py tiny`
- Check available RAM

## Performance

| Component | Speed |
|-----------|-------|
| Emotion Detection | < 100ms |
| Knowledge (TinyLlama) | 10-20s |
| Knowledge (Phi3) | 3-5s |
| Knowledge (Llama 3.2) | 2-3s |

## License

MIT License
