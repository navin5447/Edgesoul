@echo off
echo ========================================
echo Starting EdgeSoul - Complete Stack
echo ========================================
echo.

REM Check if Ollama is running
echo [1/5] Checking Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo   Warning: Ollama not running. Starting Ollama...
    start "Ollama Service" cmd /k "ollama serve"
    timeout /t 3 >nul
) else (
    echo   OK: Ollama is running
)
echo.

REM Start Backend
echo [2/4] Starting Backend (FastAPI)...
cd backend
start "EdgeSoul Backend" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..
timeout /t 3 >nul
echo   OK: Backend started on http://localhost:8000
echo.

REM Start Frontend
echo [3/4] Starting Frontend (Next.js)...
cd frontend
start "EdgeSoul Frontend" cmd /k "npm run dev"
cd ..
timeout /t 5 >nul
echo   OK: Frontend started on http://localhost:3000
echo.

REM Start Desktop App
echo [4/4] Starting Desktop App...
cd desktop
start "EdgeSoul Desktop" cmd /k "set NODE_ENV=development && npm start"
cd ..
echo   OK: Desktop app launching...
echo.

echo ========================================
echo EdgeSoul Stack Started Successfully!
echo ========================================
echo.
echo Services:
echo   - Ollama:   http://localhost:11434
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:3000
echo   - Desktop:  Electron App
echo.
echo All services are running in separate windows.
echo Close this window to keep services running.
echo To stop all services, run: stop-edgesoul.bat
echo.
pause
