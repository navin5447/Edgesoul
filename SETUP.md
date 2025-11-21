# EdgeSoul v3.0 - Complete Setup Guide

This comprehensive guide will help you install and run EdgeSoul from scratch.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prerequisites](#installing-prerequisites)
3. [Installing Ollama & Models](#installing-ollama--models)
4. [Installing EdgeSoul](#installing-edgesoul)
5. [Running EdgeSoul](#running-edgesoul)
6. [Testing the Bot](#testing-the-bot)
7. [Switching Models](#switching-models)
8. [Building Desktop App](#building-desktop-app)
9. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.13+, Ubuntu 18.04+
- **RAM**: 4GB free (2.6GB minimum for TinyLlama)
- **Storage**: 10GB free space
- **CPU**: Modern dual-core processor
- **Internet**: Required for initial setup only

### Recommended Requirements
- **RAM**: 8GB free (for Phi3 or Llama 3.2)
- **CPU**: Quad-core processor
- **GPU**: Optional (for faster inference)

---

## Installing Prerequisites

### 1. Install Node.js

**Windows/macOS:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Download **LTS version** (18.x or 20.x)
3. Run installer with default settings
4. Verify installation:
```powershell
node --version
npm --version
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 2. Install Python

**Windows:**
1. Download from [python.org](https://www.python.org/downloads/)
2. Download **Python 3.9+** or **Python 3.11** (recommended)
3. ⚠️ **IMPORTANT**: Check "Add Python to PATH" during installation
4. Verify:
```powershell
python --version
pip --version
```

**macOS:**
```bash
# Using Homebrew
brew install python@3.11

# Verify
python3 --version
pip3 --version
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3-pip

# Verify
python3 --version
pip3 --version
```

### 3. Install Git (Optional but Recommended)

**Windows:**
- Download from [git-scm.com](https://git-scm.com/)
- Run installer with default settings

**macOS:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt install git
```

---

## Installing Ollama & Models

### 1. Install Ollama

**Windows:**
1. Go to [ollama.ai](https://ollama.ai)
2. Click "Download for Windows"
3. Run the installer (`OllamaSetup.exe`)
4. Follow installation wizard
5. Ollama will start automatically

**macOS:**
1. Go to [ollama.ai](https://ollama.ai)
2. Click "Download for Mac"
3. Open the `.dmg` file
4. Drag Ollama to Applications
5. Launch Ollama from Applications

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Verify Ollama Installation

```bash
# Check version
ollama --version

# Check if Ollama is running
ollama list
```

If not running, start it:
```bash
# Windows/macOS: It should auto-start, or launch from Start menu/Applications
# Linux:
ollama serve
```

### 3. Pull AI Models

**TinyLlama (Recommended for 2-4GB RAM)**
```bash
ollama pull tinyllama
```
- Size: ~600MB
- Speed: 10-20 seconds per response
- Quality: Good

**Phi3:mini (Recommended for 4-8GB RAM)**
```bash
ollama pull phi3:mini
```
- Size: ~2.3GB
- Speed: 3-5 seconds per response
- Quality: Excellent

**Llama 3.2 (Best Quality, needs 8GB+ RAM)**
```bash
ollama pull llama3.2
```
- Size: ~4.7GB
- Speed: 2-3 seconds per response
- Quality: Best

**Verify models installed:**
```bash
ollama list
```

You should see your downloaded model(s) listed.

---

## Installing EdgeSoul

### Method 1: Using Git (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/edgesoul.git
cd edgesoul
```

### Method 2: Download ZIP

1. Go to GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract ZIP file
4. Open terminal in extracted folder

### Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Desktop App:**
```bash
cd desktop
npm install
cd ..
```

---

## Running EdgeSoul

### Option 1: Desktop App (Easiest)

```powershell
# Make sure you're in the edgesoul root directory
cd desktop
npm start
```

**What happens:**
- ✅ Electron window opens
- ✅ Backend starts automatically on port 8000
- ✅ Frontend loads at http://localhost:3000
- ✅ System tray icon appears
- ✅ Ready to chat!

### Option 2: Manual Start (Development)

**Terminal 1 - Backend:**
```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```

Wait for: `✅ Application startup complete.`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Wait for: `✓ Ready in X seconds`

**Terminal 3 - Browser:**
Open: http://localhost:3000/chat

### Option 3: Using Batch Scripts (Windows)

**Start Everything:**
```powershell
.\start-edgesoul.bat
```

**Stop Everything:**
```powershell
.\stop-edgesoul.bat
```

---

## Testing the Bot

### Test Emotional Intelligence

**Try these messages:**

```
"I'm feeling really sad and lonely"
```
Expected: Empathetic, supportive response

```
"I'm scolded but I didn't do it"
```
Expected: Detects sadness (victim context), not anger

```
"make me feel confident"
```
Expected: Action-oriented empowering response

```
"help me calm down"
```
Expected: Breathing exercises and grounding techniques

### Test Knowledge Engine

**Ask questions:**

```
"What is quantum physics?"
```
Expected: Detailed explanation from AI

```
"Tell me a joke"
```
Expected: A clean, funny joke

```
"How do I learn Python programming?"
```
Expected: Learning guide and resources

```
"Write code for bubble sort in Python"
```
Expected: Working Python code

### Test Intent Detection

```
"something but it didn't no what is the reason"
```
Expected: Casual/clarification response (NOT knowledge article)

```
"What is artificial intelligence?"
```
Expected: Knowledge response (starts with "What is")

---

## Switching Models

EdgeSoul makes it easy to switch between AI models:

```bash
cd backend

# Switch to TinyLlama (lightest)
python switch_model.py tiny

# Switch to Phi3 (better quality)
python switch_model.py phi3

# Switch to Llama 3.2 (best quality)
python switch_model.py llama3

# Then restart the backend
```

**How to choose:**
- **2-4GB RAM available**: Use TinyLlama
- **4-8GB RAM available**: Use Phi3:mini
- **8GB+ RAM available**: Use Llama 3.2

**Check available RAM:**
```powershell
# Windows
Get-CimInstance Win32_OperatingSystem | Select-Object @{Name="FreeRAM_GB";Expression={[math]::Round($_.FreePhysicalMemory/1MB, 2)}}

# macOS/Linux
free -h
```

---

## Building Desktop App

### Development Build

```bash
cd desktop
npm start
```

### Production Build

**For your platform:**
```bash
cd desktop
npm run build
```

**For Windows:**
```bash
npm run build:win
```
Output: `desktop/dist/EdgeSoul-Setup-3.0.0.exe`

**For macOS:**
```bash
npm run build:mac
```
Output: `desktop/dist/EdgeSoul-3.0.0.dmg`

**For Linux:**
```bash
npm run build:linux
```
Output: `desktop/dist/EdgeSoul-3.0.0.AppImage`

### Install & Run

**Windows:**
1. Double-click `EdgeSoul-Setup-3.0.0.exe`
2. Follow installation wizard
3. Launch from Start Menu or desktop

**macOS:**
1. Open `EdgeSoul-3.0.0.dmg`
2. Drag EdgeSoul to Applications
3. Launch from Applications folder

**Linux:**
```bash
chmod +x EdgeSoul-3.0.0.AppImage
./EdgeSoul-3.0.0.AppImage
```

---

## Troubleshooting

### "Ollama not found" or "Connection refused"

**Solution:**
```bash
# Check if Ollama is running
ollama list

# If not running:
# Windows/macOS: Launch Ollama from Start menu/Applications
# Linux:
ollama serve
```

### "Backend failed to start"

**Solution:**
```bash
# 1. Check if port 8000 is in use
# Windows:
netstat -ano | findstr :8000

# 2. Kill process using port 8000
# Windows:
taskkill /F /PID <PID>

# 3. Check Python dependencies
cd backend
pip install -r requirements.txt
```

### "Emotion model not found"

**Solution:**
```bash
# The emotion model should be at:
# models/emotion_model.onnx

# If missing, check backend/services/emotion_service.py
# The model is included in the repository
```

### "npm install fails" or "Package not found"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### "Python module not found" errors

**Solution:**
```bash
# Make sure you're in backend folder
cd backend

# Reinstall all dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### "Responses are very slow"

**Solutions:**
1. **Check RAM usage** - Close unnecessary apps
2. **Switch to lighter model**:
   ```bash
   cd backend
   python switch_model.py tiny
   ```
3. **Check Ollama is running locally**:
   ```bash
   ollama list
   ```

### "Desktop app shows blank screen"

**Solution:**
```bash
# 1. Check if backend is running
# Open http://localhost:8000/docs in browser

# 2. Check if frontend is accessible
# Open http://localhost:3000/chat in browser

# 3. Rebuild desktop app
cd desktop
rm -rf node_modules
npm install
npm start
```

### "GPU errors on Windows"

**Already Fixed!** The app now disables GPU acceleration automatically.

If you still see GPU errors:
```bash
# Check desktop/main.js contains:
app.disableHardwareAcceleration();
```

---

## Performance Optimization

### For Low RAM Systems (< 4GB)

1. **Use TinyLlama**:
   ```bash
   cd backend
   python switch_model.py tiny
   ```

2. **Close other applications**:
   - Close Chrome/Firefox tabs
   - Close unnecessary programs
   - Disable startup programs

3. **Reduce Ollama memory**:
   Edit Ollama settings to limit RAM usage

### For Better Response Speed

1. **Use Phi3 or Llama 3.2**:
   ```bash
   python switch_model.py phi3
   ```

2. **Use SSD** (not HDD) for better model loading

3. **Ensure Ollama uses GPU** (if available):
   - Ollama automatically detects and uses GPU
   - Check with `nvidia-smi` (NVIDIA) or `rocm-smi` (AMD)

---

## Next Steps

After successful setup:

1. ✅ **Test emotional responses** - Try different emotions
2. ✅ **Test knowledge queries** - Ask various questions
3. ✅ **Explore settings** - Customize to your preferences
4. ✅ **Read documentation** - Check backend/frontend READMEs
5. ✅ **Contribute** - Report bugs, suggest features!

---

## Quick Reference

### Start Commands

```bash
# Desktop app
cd desktop && npm start

# Manual (backend)
cd backend && python -m uvicorn main:app --reload

# Manual (frontend)
cd frontend && npm run dev

# Windows batch
.\start-edgesoul.bat
```

### Stop Commands

```bash
# Windows batch
.\stop-edgesoul.bat

# Manual
Ctrl+C in each terminal
```

### Test Commands

```bash
cd backend
python test_emotion_quick.py        # Test emotions
python test_ollama_working.py       # Test Ollama
python test_complete_system.py      # Test everything
```

### URLs

- Frontend: http://localhost:3000/chat
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Ollama: http://localhost:11434

---

## Support

- 📖 **Documentation**: Check README.md and other docs
- 🐛 **Issues**: GitHub Issues
- 💬 **Questions**: GitHub Discussions
- 📧 **Email**: support@edgesoul.app

---

**Congratulations! You're now ready to use EdgeSoul! 🎉**

[⬆ Back to top](#edgesoul-v30---complete-setup-guide)
