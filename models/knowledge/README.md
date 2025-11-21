# Knowledge Reasoning Model

This directory contains the knowledge reasoning LLM for EdgeSoul v2.

## Model Options

EdgeSoul v2 supports multiple LLM backends:

### Local Models (Edge Deployment)

#### 1. TinyLlama (Recommended for Edge)
- **Size**: 1.1GB
- **Model**: TinyLlama/TinyLlama-1.1B-Chat-v1.0
- **Best for**: Edge devices, fast inference
- **Performance**: Good quality, fast responses

#### 2. GPT-2
- **Size**: 774MB
- **Model**: gpt2 / gpt2-medium
- **Best for**: Very constrained environments
- **Performance**: Basic conversational ability

#### 3. Llama 2 7B
- **Size**: 13GB
- **Model**: meta-llama/Llama-2-7b-chat-hf
- **Best for**: Server deployment
- **Performance**: Excellent quality
- **Note**: Requires Hugging Face authentication

### API-Based Models

#### 1. OpenAI
- GPT-3.5-turbo (recommended)
- GPT-4

#### 2. Anthropic
- Claude 3 Sonnet
- Claude 3 Opus

## Configuration

Edit `backend/.env` to configure the model:

```bash
# Use local model
USE_LOCAL_LLM=true
KNOWLEDGE_MODEL_PATH=../models/knowledge/weights

# Or use API-based model
USE_LOCAL_LLM=false
OPENAI_API_KEY=your_api_key
```

## Usage

### Local Model

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

prompt = "You are EdgeSoul, a helpful AI assistant.\n\nUser: Hello!\nAssistant:"
inputs = tokenizer(prompt, return_tensors="pt")

outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    temperature=0.7,
    do_sample=True,
)

response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### API Model

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key="your_api_key")

response = await client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are EdgeSoul, a helpful AI assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    temperature=0.7,
    max_tokens=100,
)
```

## Prompt Templates

Customize prompts in the `prompts/` directory:
- `system_prompt.txt`: Base system prompt
- `emotion_aware_prompt.txt`: Emotion-aware conversation
- `knowledge_prompt.txt`: Knowledge-based queries

## Optimization for Edge

### 4-bit Quantization (Recommended)
```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=quantization_config,
    device_map="auto",
)
```

### 8-bit Quantization
```python
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    load_in_8bit=True,
    device_map="auto",
)
```

## Performance Comparison

| Model | Size | Inference Time (CPU) | Quality | Edge-Ready |
|-------|------|---------------------|---------|------------|
| GPT-2 | 774MB | ~1s | ⭐⭐ | ✅ |
| TinyLlama | 1.1GB | ~1.5s | ⭐⭐⭐⭐ | ✅ |
| Llama 2 7B | 13GB | ~5s | ⭐⭐⭐⭐⭐ | ❌ |
| Llama 2 7B (4-bit) | 3.5GB | ~2s | ⭐⭐⭐⭐ | ✅ |
| GPT-3.5 (API) | - | ~1s | ⭐⭐⭐⭐⭐ | N/A |

## Download

```bash
# Download TinyLlama (recommended)
python ../download_models.py --knowledge-model tinyllama

# Download GPT-2
python ../download_models.py --knowledge-model gpt2

# Download Llama 2 (requires auth)
huggingface-cli login
python ../download_models.py --knowledge-model llama2
```

## Model Files

- `weights/`: Model weights directory
- `config.json`: Model configuration
- `prompts/`: Prompt templates
- `README.md`: This file
