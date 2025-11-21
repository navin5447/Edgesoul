#!/bin/bash
# EdgeSoul Desktop Build Script
# Builds and packages the desktop application for distribution

set -e  # Exit on error

echo "🚀 EdgeSoul Desktop Build Pipeline"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
DESKTOP_DIR="$PROJECT_ROOT/desktop"
BUILD_DIR="$PROJECT_ROOT/build"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"

# Step 1: Clean previous builds
echo -e "\n${BLUE}Step 1: Cleaning previous builds...${NC}"
rm -rf "$BUILD_DIR"
rm -rf "$FRONTEND_DIR/out"
rm -rf "$FRONTEND_DIR/.next"
rm -rf "$BACKEND_DIR/dist"
rm -rf "$DESKTOP_DIR/dist"
mkdir -p "$BUILD_DIR"

# Step 2: Build Frontend (Next.js static export)
echo -e "\n${BLUE}Step 2: Building Next.js frontend...${NC}"
cd "$FRONTEND_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build static export
echo "Building Next.js for production..."
npm run build
npm run export || echo "Note: Using 'next build' output directly"

echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 3: Package Backend (PyInstaller)
echo -e "\n${BLUE}Step 3: Packaging Python backend...${NC}"
cd "$PROJECT_ROOT"
python scripts/package-backend.py

echo -e "${GREEN}✓ Backend packaged successfully${NC}"

# Step 4: Install Electron dependencies
echo -e "\n${BLUE}Step 4: Installing Electron dependencies...${NC}"
cd "$DESKTOP_DIR"

if [ ! -d "node_modules" ]; then
    npm install
fi

# Step 5: Build Electron app
echo -e "\n${BLUE}Step 5: Building Electron application...${NC}"

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
    npm run build:mac
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    PLATFORM="win"
    npm run build:win
else
    PLATFORM="linux"
    npm run build:linux
fi

echo -e "${GREEN}✓ Electron app built for $PLATFORM${NC}"

# Step 6: Copy build artifacts
echo -e "\n${BLUE}Step 6: Organizing build artifacts...${NC}"
mkdir -p "$BUILD_DIR/installers"

# Copy installers
if [ -d "$DESKTOP_DIR/dist" ]; then
    cp -r "$DESKTOP_DIR/dist"/* "$BUILD_DIR/installers/" || true
fi

# Get version from package.json
VERSION=$(node -p "require('$DESKTOP_DIR/package.json').version")

echo -e "\n${GREEN}=================================="
echo -e "✅ Build completed successfully!"
echo -e "==================================${NC}"
echo -e "Version: ${BLUE}v$VERSION${NC}"
echo -e "Platform: ${BLUE}$PLATFORM${NC}"
echo -e "Output: ${BLUE}$BUILD_DIR/installers${NC}"
echo ""
echo "Installers created:"
ls -lh "$BUILD_DIR/installers" | grep -v '^d' || echo "Check dist directory for output files"

# Print installer sizes
echo -e "\n${BLUE}Installer sizes:${NC}"
du -h "$BUILD_DIR/installers"/* 2>/dev/null || du -h "$DESKTOP_DIR/dist"/*

echo -e "\n${GREEN}🎉 Ready for distribution!${NC}"
