@echo off
REM EdgeSoul Desktop Build Script for Windows
REM Run this to build the desktop application

echo ========================================
echo EdgeSoul Desktop Build Pipeline
echo ========================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set FRONTEND_DIR=%PROJECT_ROOT%\frontend
set BACKEND_DIR=%PROJECT_ROOT%\backend
set DESKTOP_DIR=%PROJECT_ROOT%\desktop
set BUILD_DIR=%PROJECT_ROOT%\build

echo Project root: %PROJECT_ROOT%
echo.

REM Step 1: Clean previous builds
echo Step 1: Cleaning previous builds...
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
if exist "%FRONTEND_DIR%\out" rmdir /s /q "%FRONTEND_DIR%\out"
if exist "%FRONTEND_DIR%\.next" rmdir /s /q "%FRONTEND_DIR%\.next"
if exist "%BACKEND_DIR%\dist" rmdir /s /q "%BACKEND_DIR%\dist"
if exist "%DESKTOP_DIR%\dist" rmdir /s /q "%DESKTOP_DIR%\dist"
mkdir "%BUILD_DIR%"
echo   Cleanup complete
echo.

REM Step 2: Build Frontend
echo Step 2: Building Next.js frontend...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo   Installing frontend dependencies...
    call npm install
)
echo   Building Next.js for production...
call npm run build
echo   Frontend built successfully
echo.

REM Step 3: Package Backend
echo Step 3: Packaging Python backend...
cd /d "%PROJECT_ROOT%"
python scripts\package-backend.py
if %ERRORLEVEL% NEQ 0 (
    echo   ERROR: Backend packaging failed!
    pause
    exit /b 1
)
echo   Backend packaged successfully
echo.

REM Step 4: Install Electron dependencies
echo Step 4: Installing Electron dependencies...
cd /d "%DESKTOP_DIR%"
if not exist "node_modules" (
    call npm install
)
echo   Dependencies installed
echo.

REM Step 5: Build Electron app
echo Step 5: Building Electron application for Windows...
call npm run build:win
echo   Electron app built successfully
echo.

REM Step 6: Organize build artifacts
echo Step 6: Organizing build artifacts...
mkdir "%BUILD_DIR%\installers" 2>nul
if exist "%DESKTOP_DIR%\dist" (
    xcopy /s /y "%DESKTOP_DIR%\dist\*" "%BUILD_DIR%\installers\"
)
echo   Build artifacts organized
echo.

echo ========================================
echo   Build completed successfully!
echo ========================================
echo Output: %BUILD_DIR%\installers
echo.
echo Installers created:
dir /b "%BUILD_DIR%\installers"
echo.
echo Ready for distribution!
echo.

pause
