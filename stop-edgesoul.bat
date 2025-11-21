@echo off
echo ========================================
echo Stopping EdgeSoul - All Services
echo ========================================
echo.

echo Stopping Ollama...
taskkill /FI "WindowTitle eq Ollama*" /T /F >nul 2>&1

echo Stopping Backend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /PID %%a /F >nul 2>&1

echo Stopping Frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1

echo Stopping Desktop App...
taskkill /IM EdgeSoul.exe /F >nul 2>&1
taskkill /IM electron.exe /F >nul 2>&1

echo.
echo All EdgeSoul services stopped
pause
