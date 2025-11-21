# 🚀 EdgeSoul API Documentation

## Overview

Fast FastAPI application with two main endpoints:
- **`/analyze`** - Quick emotion detection only
- **`/chat`** - Full conversation with AI (emotion + knowledge + tone)

---

## 🎯 Quick Start

### Start the Server:
```powershell
cd C:\Users\Navinkumar\Downloads\Edgesoul\backend
python app.py
```

Server will run on: **http://localhost:8000**

### Test the API:
```powershell
python test_app.py
```

### View API Docs:
Open in browser: **http://localhost:8000/docs**

---

## 📡 API Endpoints

### 1. **GET /** - Root
Get API information

**Response:**
```json
{
  "name": "EdgeSoul Chatbot API",
  "version": "2.0.0",
  "status": "running",
  "endpoints": {...}
}
```

---

### 2. **GET /health** - Health Check
Check if services are running

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "emotion_detection": true,
    "knowledge_engine": true,
    "model": "tinyllama"
  },
  "timestamp": 1699875330.5
}
```

---

### 3. **POST /analyze** - Emotion Detection ⚡
Fast emotion analysis without generating responses

**Request:**
```json
{
  "text": "I'm so happy today!"
}
```

**Response:**
```json
{
  "emotion": "joy",
  "confidence": 95.5,
  "all_emotions": {
    "joy": 95.5,
    "love": 2.3,
    "surprise": 1.1,
    "sadness": 0.5,
    "anger": 0.4,
    "fear": 0.2
  },
  "processing_time": 0.15
}
```

**Speed:** ~0.1-0.2 seconds ⚡

**Use Cases:**
- Quick emotion checking
- Real-time emotion monitoring
- Sentiment analysis
- Emotion-based filtering

---

### 4. **POST /chat** - Full Conversation 🤖
Complete chatbot with emotion + knowledge + tone

**Request:**
```json
{
  "message": "What is backward chaining?",
  "context": "User was asking about AI concepts"  // Optional
}
```

**Response:**
```json
{
  "response": "Backward chaining is a reasoning strategy in AI that starts with a goal and works backwards to find the facts that support it. It's used in expert systems...",
  "emotion": {
    "primary": "joy",
    "confidence": 85.5,
    "all": {
      "joy": 85.5,
      "love": 8.2,
      "surprise": 3.1,
      "sadness": 1.5,
      "anger": 1.0,
      "fear": 0.7
    }
  },
  "response_type": "hybrid_knowledge",
  "tone": "joyful",
  "metadata": {
    "processing_time": 0.45,
    "total_processing_time": 12.5,
    "model": "tinyllama",
    "knowledge_used": true,
    "timestamp": "2025-11-13T09:15:30"
  }
}
```

**Speed:** 
- With tinyllama: ~10-20 seconds
- With phi3:mini: ~3-5 seconds (needs 4GB+ free RAM)

**Features:**
- ✅ Detects emotion from user message
- ✅ Classifies as knowledge query or emotional expression
- ✅ Generates AI-powered response using Ollama
- ✅ Applies emotional tone to response
- ✅ Returns complete metadata

**Use Cases:**
- Full chatbot conversations
- Knowledge Q&A with emotion
- Empathetic responses
- Learning assistant

---

### 5. **GET /analyze/{text}** - Quick Emotion Check
Convenience GET endpoint for testing

**Example:**
```
GET /analyze/I am very excited!
```

**Response:**
```json
{
  "text": "I am very excited!",
  "emotion": "joy",
  "confidence": 92.3,
  "all_emotions": {
    "joy": 92.3,
    "surprise": 4.5,
    "love": 2.1,
    "sadness": 0.6,
    "anger": 0.3,
    "fear": 0.2
  }
}
```

---

### 6. **GET /models** - List AI Models
Show available Ollama models

**Response:**
```json
{
  "status": "online",
  "current_model": "tinyllama",
  "available_models": [
    {"name": "tinyllama", "size": "637 MB"},
    {"name": "phi3:mini", "size": "2.2 GB"}
  ],
  "can_switch_to": ["tinyllama", "phi3:mini", "mistral:7b"]
}
```

---

## 🧪 Testing Examples

### Using cURL:

**Test /analyze:**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I am so happy!"}'
```

**Test /chat:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is AI?"}'
```

### Using Python:

```python
import requests

# Analyze emotion
response = requests.post(
    "http://localhost:8000/analyze",
    json={"text": "I'm feeling great!"}
)
print(response.json())

# Chat
response = requests.post(
    "http://localhost:8000/chat",
    json={"message": "What is backward chaining?"}
)
print(response.json())
```

### Using JavaScript (Frontend):

```javascript
// Analyze emotion
const analyzeEmotion = async (text) => {
  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return await response.json();
};

// Chat
const chat = async (message, context = null) => {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context })
  });
  return await response.json();
};

// Usage
const emotion = await analyzeEmotion("I'm so excited!");
const reply = await chat("What can I learn today?");
```

---

## ⚡ Performance

### /analyze endpoint:
- **Speed**: 0.1-0.2 seconds
- **Memory**: ~100MB
- **Best for**: Quick emotion checks

### /chat endpoint:
- **Speed**: 
  - tinyllama: 10-20 seconds
  - phi3:mini: 3-5 seconds (needs 4GB+ free RAM)
- **Memory**: 
  - tinyllama: ~1GB
  - phi3:mini: ~4GB
- **Best for**: Full conversations

---

## 🔧 Configuration

### Switch AI Model:
```powershell
# Switch to tiny (current - 10-20s responses)
python switch_model.py tiny

# Switch to phi3 (faster - 3-5s responses, needs 4GB+ RAM)
python switch_model.py phi3

# Restart server
python app.py
```

### CORS Settings:
Edit in `app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### Server won't start:
```powershell
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F
```

### Ollama not working:
```powershell
# Check if Ollama is running
Get-Process ollama*

# Start Ollama
$ollamaPath = "C:\Users\Navinkumar\AppData\Local\Programs\Ollama\ollama.exe"
Start-Process -FilePath $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
```

### Slow responses:
- Using tinyllama: Normal (10-20s)
- Want faster? Free up RAM and switch to phi3:mini
- Or use OpenAI API for 2-3s responses

---

## 📊 Response Types

### hybrid_knowledge:
User asked a knowledge question → AI generates factual answer with emotional tone

**Example:**
```
User: "What is AI?"
Bot: [Factual AI explanation with joyful tone]
```

### emotional_support:
User expressed emotion → Bot gives empathetic response

**Example:**
```
User: "I'm feeling sad..."
Bot: "I understand you're feeling down. It's okay to feel this way..."
```

---

## 🚀 Deployment

### Local Development:
```powershell
python app.py
```

### Production (with Gunicorn):
```bash
pip install gunicorn
gunicorn app:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker:
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

---

## 📚 API Documentation

**Interactive Docs**: http://localhost:8000/docs  
**ReDoc**: http://localhost:8000/redoc

---

**Built with FastAPI + Ollama + DistilBERT** 🚀
