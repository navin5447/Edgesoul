# EdgeSoul v3.0 - Emotional AI Chatbot Desktop App

<div align="center">

**Your Personal AI Companion with Emotional Intelligence**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()
[![Python](https://img.shields.io/badge/python-3.9%2B-blue)]()
[![Node](https://img.shields.io/badge/node-18%2B-green)]()

*An intelligent chatbot that understands your emotions and responds with empathy + knowledge*

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 🌟 What is EdgeSoul?

EdgeSoul is a **privacy-first AI chatbot** that runs completely on your computer. It combines:
- ✨ **Emotional Intelligence** - Detects and responds to your emotions (joy, sadness, anger, fear, love, surprise)
- 🧠 **Knowledge Reasoning** - Answers questions using local AI (Ollama)
- 🔒 **100% Private** - Everything runs locally, no data sent to cloud
- 💰 **Completely Free** - No API costs, no subscriptions
- 📱 **Desktop App** - Native app for Windows, macOS, Linux

---

## 🚀 Features

### 🎭 Emotional Intelligence
- **85%+ Emotion Accuracy** - Advanced ONNX emotion detection model
- **Mixed Emotion Support** - Detects complex feelings like "happy but worried"
- **Context-Aware** - Understands victim/blamed context, negations, fear indicators
- **Empathetic Responses** - Adjusts tone based on your emotional state

### 🧠 Knowledge Engine
- **Local AI** - Powered by Ollama (TinyLlama, Phi3, or other models)
- **Offline Capable** - Works without internet after setup
- **Fast Responses** - 10-20 seconds with TinyLlama, 3-5s with Phi3
- **Unlimited Questions** - Ask anything, completely free

### 🎯 Smart Response System
- **Intent Detection** - Recognizes when you want encouragement, calm, or information
- **Action-Oriented** - Provides practical, helpful responses
- **Hybrid Responses** - Combines emotional support with factual knowledge
- **Memory & Learning** - Adapts to your conversation style

### 🖥️ Desktop Application
- **Cross-Platform** - Windows, macOS, Linux support
- **System Tray** - Minimize to tray, global shortcuts
- **Auto-Start Backend** - No manual server setup needed
- **Dark/Light Theme** - Beautiful ChatGPT-style interface
- **Offline Storage** - IndexedDB for conversation history

---

## 📋 Prerequisites

### Required
- **Node.js** 18 or higher
- **Python** 3.9 or higher  
- **Ollama** - [Download from ollama.ai](https://ollama.ai)
- **RAM**: 4GB+ free (2.6GB minimum for TinyLlama)

### Optional
- **Git** - For cloning the repository
- **Code Editor** - VS Code recommended

---

## ⚡ Quick Start

### Option 1: Desktop App (Easiest)

```powershell
# 1. Clone the repository
git clone https://github.com/yourusername/edgesoul.git
cd edgesoul

# 2. Install Ollama and pull a model
ollama pull tinyllama

# 3. Start the desktop app
cd desktop
npm install
npm start
```

The app will automatically start the backend and open the chat interface!

### Option 2: Manual Start

```powershell
# Terminal 1: Start backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend  
cd frontend
npm install
npm run dev

# Browser: Open http://localhost:3000/chat
```

---

## 🛠️ Installation

### Step 1: Install Ollama

**Windows/macOS:**
1. Download from [ollama.ai](https://ollama.ai)
2. Run installer
3. Open terminal and verify: `ollama --version`

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Pull AI Model

```bash
# TinyLlama (recommended for 2-4GB RAM)
ollama pull tinyllama

# OR Phi3:mini (better quality, needs 4GB+ RAM)
ollama pull phi3:mini

# OR Llama 3.2 (best quality, needs 8GB+ RAM)
ollama pull llama3.2
```

### Step 3: Install Dependencies

```bash
# Clone repository
git clone https://github.com/yourusername/edgesoul.git
cd edgesoul

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies  
cd ../frontend
npm install

# Install desktop dependencies
cd ../desktop
npm install
```

### Step 4: Run EdgeSoul

**Easy Way (Desktop App):**
```powershell
cd desktop
npm start
```

**Manual Way:**
```powershell
# Terminal 1: Backend
cd backend
python -m uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend  
npm run dev

# Open: http://localhost:3000/chat
```

---

## 💻 Usage

### Starting EdgeSoul

**Desktop App:**
```bash
cd desktop
npm start
```

**OR use batch scripts (Windows):**
```powershell
.\start-edgesoul.bat    # Start everything
.\stop-edgesoul.bat     # Stop everything
```

### Testing Emotional Intelligence

Try these messages:
```
"I'm feeling sad and lonely"
→ Empathetic support response

"I'm scolded but didn't do it"  
→ Detects sadness (victim context)

"make me feel confident"
→ Action-oriented empowering response

"help me calm down"
→ Breathing exercises and grounding
```

### Testing Knowledge Engine

Ask questions:
```
"What is quantum physics?"
"How do I learn Python?"
"Tell me a joke"
"Explain blockchain"
"Write code for bubble sort"
```

### Switching AI Models

```bash
cd backend
python switch_model.py phi3      # Switch to Phi3
python switch_model.py tiny      # Switch to TinyLlama
python switch_model.py llama3    # Switch to Llama 3.2
```

---

## 📁 Project Structure

```
Edgesoul/
├── backend/              # FastAPI backend
│   ├── services/         # Emotion, Knowledge, Chat services
│   ├── models/           # Pydantic data models
│   ├── api/v1/          # REST API endpoints
│   └── main.py          # FastAPI app entry
│
├── frontend/            # Next.js frontend
│   ├── app/             # App router pages
│   ├── components/      # React components
│   ├── context/         # LocalAuth, Chat context
│   └── lib/             # Utilities
│
├── desktop/             # Electron desktop app
│   ├── main.js          # Main process
│   ├── preload.js       # Preload script
│   └── package.json     # Electron config
│
├── models/              # AI models
│   └── emotion_model.onnx  # Emotion detection
│
├── database/            # IndexedDB schemas
│   └── migrations/      # DB migrations
│
└── shared/              # Shared utilities
    ├── constants.py/ts  # Shared constants
    └── utils.py/ts      # Shared functions
```

---

## 🔧 Configuration

### Backend Config

**File:** `backend/core/config.py`

```python
ENABLE_EMOTION_DETECTION = True
ENABLE_KNOWLEDGE_REASONING = True
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL = "tinyllama"
EMOTION_MODEL_PATH = "models/emotion_model.onnx"
```

### Frontend Config

**File:** `frontend/.env.local` (create this)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=EdgeSoul
```

### Desktop Config

**File:** `desktop/main.js`

```javascript
const BACKEND_PORT = 8000;
const FRONTEND_PORT = 3000;
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python 3.9, Pydantic, Uvicorn |
| **AI/ML** | Ollama (TinyLlama/Phi3), ONNX Runtime, Transformers |
| **Desktop** | Electron 27, electron-store, electron-updater |
| **Database** | IndexedDB (Dexie.js) for local storage |
| **Auth** | LocalAuth (no cloud, privacy-first) |

---

## 📊 Performance

| Model | Speed | Quality | RAM Required |
|-------|-------|---------|--------------|
| **TinyLlama** | 10-20s | Good ⭐⭐⭐ | 2.6GB |
| **Phi3:mini** | 3-5s | Excellent ⭐⭐⭐⭐ | 4GB |
| **Llama 3.2** | 2-3s | Best ⭐⭐⭐⭐⭐ | 8GB |

**Emotion Detection:** Real-time (< 100ms)

---

## 🧪 Testing

```bash
# Test emotion detection
cd backend
python test_emotion_quick.py

# Test knowledge engine  
python test_ollama_working.py

# Test complete system
python test_complete_system.py

# Test chatbot intelligence
python test_chatbot_intelligence.py
```

---

## 📦 Building Desktop App

```bash
# Build for your platform
cd desktop
npm run build

# Build for specific platform
npm run build:win      # Windows installer
npm run build:mac      # macOS DMG
npm run build:linux    # Linux AppImage

# Output: desktop/dist/EdgeSoul-Setup-3.0.0.exe
```

---

## 🔒 Privacy & Security

- ✅ **100% Local** - All processing on your machine
- ✅ **No Cloud** - No data sent to external servers
- ✅ **No Tracking** - No analytics, no telemetry
- ✅ **Open Source** - Audit the code yourself
- ✅ **Your Data** - Conversations stored locally in IndexedDB

---

## 🆚 EdgeSoul vs ChatGPT

| Feature | EdgeSoul | ChatGPT |
|---------|----------|---------|
| **Cost** | FREE ✅ | $20/month 💰 |
| **Privacy** | 100% local ✅ | Cloud-based ❌ |
| **Internet** | Offline after setup ✅ | Always needs internet ❌ |
| **Emotion Detection** | Advanced (85%+) ✅ | Basic ❌ |
| **Response Speed** | 3-20s ⏱️ | 2-3s ⚡ |
| **Knowledge** | Good ⭐⭐⭐ | Excellent ⭐⭐⭐⭐⭐⭐ |
| **Customization** | Full control ✅ | Limited ❌ |

---

## 🐛 Troubleshooting

### "Backend failed to start"
```bash
# Check Ollama is running
ollama list

# Restart Ollama
ollama serve

# Check Python dependencies
cd backend
pip install -r requirements.txt
```

### "Emotion model not found"
```bash
# Emotion model should be at:
models/emotion_model.onnx

# If missing, check backend/services/emotion_service.py
```

### "Responses too slow"
```bash
# Switch to faster model
cd backend
python switch_model.py phi3

# Check available RAM
# Close other applications to free memory
```

### "Desktop app won't start"
```bash
# Rebuild desktop app
cd desktop
npm install
npm start

# Check logs in console
```

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed installation guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[backend/README.md](backend/README.md)** - Backend architecture
- **[models/README.md](models/README.md)** - Model information
- **[database/README.md](database/README.md)** - Database schemas

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ways to contribute:**
- 🐛 Report bugs
- ✨ Suggest features  
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repo!

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software.

---

## 🙏 Acknowledgments

- **Ollama** - Local LLM inference
- **Hugging Face** - ML models and transformers
- **FastAPI** - Modern Python API framework
- **Next.js** - React framework
- **Electron** - Cross-platform desktop apps

---

## 📧 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/edgesoul/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/edgesoul/discussions)
- 📧 **Email**: support@edgesoul.app

---

<div align="center">

**Built with ❤️ for privacy, emotion, and intelligence**

⭐ Star us on GitHub if you like EdgeSoul!

[⬆ Back to top](#edgesoul-v30---emotional-ai-chatbot-desktop-app)

</div>
