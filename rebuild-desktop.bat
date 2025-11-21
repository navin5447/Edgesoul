@echo off
echo ========================================
echo Rebuilding EdgeSoul Desktop App
echo ========================================
echo.

echo Step 1: Killing all EdgeSoul processes...
taskkill /F /IM EdgeSoul.exe /T 2>nul
taskkill /F /IM edgesoul-backend.exe /T 2>nul
timeout /t 3 /nobreak >nul
echo   Processes killed

echo.
echo Step 2: Cleaning dist folder...
cd /d "%~dp0desktop"
rmdir /s /q dist 2>nul
echo   Cleaned

echo.
echo Step 3: Building desktop app...
call npm run build:win
if errorlevel 1 (
    echo   ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Copying backend to resources...
xcopy /E /I /Y "..\backend\dist\*" "dist\win-unpacked\resources\backend\" >nul
echo   Backend copied

echo.
echo ========================================
echo ✅ Desktop app rebuilt successfully!
echo ========================================
echo.
echo Location: %~dp0desktop\dist\
echo   - Installer: EdgeSoul-3.0.0-x64.exe
echo   - Portable: win-unpacked\EdgeSoul.exe
echo.
pause
