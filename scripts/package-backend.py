"""
EdgeSoul Backend Packaging Script
Packages the FastAPI backend into a standalone executable using PyInstaller
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

# Colors for terminal output
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'

def print_step(message):
    print(f"\n{Colors.BLUE}{message}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")
    
def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

# Get paths
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
MODELS_DIR = PROJECT_ROOT / "models"
DIST_DIR = BACKEND_DIR / "dist"
BUILD_DIR = BACKEND_DIR / "build"

def check_requirements():
    """Check if PyInstaller and dependencies are installed"""
    print_step("Checking requirements...")
    
    try:
        import PyInstaller
        print_success("PyInstaller is installed")
    except ImportError:
        print_error("PyInstaller not found!")
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print_success("PyInstaller installed")

def clean_previous_builds():
    """Remove previous build artifacts"""
    print_step("Cleaning previous builds...")
    
    dirs_to_clean = [DIST_DIR, BUILD_DIR, BACKEND_DIR / "edgesoul-backend.spec"]
    
    for dir_path in dirs_to_clean:
        if dir_path.exists():
            if dir_path.is_dir():
                shutil.rmtree(dir_path)
                print(f"  Removed {dir_path.name}/")
            else:
                dir_path.unlink()
                print(f"  Removed {dir_path.name}")
    
    print_success("Cleanup complete")

def create_spec_file():
    """Create PyInstaller spec file"""
    print_step("Creating PyInstaller spec file...")
    
    spec_content = f'''# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Add all Python files
a = Analysis(
    ['main.py'],
    pathex=[r'{BACKEND_DIR}'],
    binaries=[],
    datas=[
        (r'{BACKEND_DIR}/models', 'models'),
        (r'{BACKEND_DIR}/core', 'core'),
        (r'{BACKEND_DIR}/services', 'services'),
        (r'{BACKEND_DIR}/api', 'api'),
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'httpx',
        'onnxruntime',
        'numpy',
        'loguru',
        'pydantic',
        'fastapi',
    ],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'scipy', 'pandas'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='edgesoul-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
'''
    
    spec_file = BACKEND_DIR / "edgesoul-backend.spec"
    spec_file.write_text(spec_content)
    print_success(f"Created {spec_file.name}")
    
    return spec_file

def build_executable(spec_file):
    """Build the executable using PyInstaller"""
    print_step("Building executable with PyInstaller...")
    print_warning("This may take several minutes...")
    
    try:
        cmd = [
            "pyinstaller",
            "--clean",
            "-y",  # Overwrite without asking
            str(spec_file)
        ]
        
        subprocess.check_call(cmd, cwd=BACKEND_DIR)
        print_success("Executable built successfully")
        
    except subprocess.CalledProcessError as e:
        print_error(f"Build failed: {e}")
        sys.exit(1)

def copy_models():
    """Copy model files to dist directory"""
    print_step("Copying model files...")
    
    dist_models = DIST_DIR / "models"
    
    # Copy ONNX model
    if MODELS_DIR.exists():
        if dist_models.exists():
            shutil.rmtree(dist_models)
        shutil.copytree(MODELS_DIR, dist_models)
        print_success(f"Copied models to dist/models/")
    
    # Also copy models from backend/models if they exist
    backend_models = BACKEND_DIR / "models"
    if backend_models.exists():
        for model_file in backend_models.glob("*"):
            if model_file.suffix in ['.onnx', '.txt', '.json']:
                shutil.copy(model_file, dist_models / model_file.name)
                print(f"  Copied {model_file.name}")

def optimize_size():
    """Optimize the build size"""
    print_step("Optimizing build size...")
    
    # Remove unnecessary files
    unnecessary_patterns = [
        "*.pyc",
        "__pycache__",
        "*.pyo",
        "*.pyd",
        ".git",
        ".pytest_cache",
    ]
    
    removed_count = 0
    for pattern in unnecessary_patterns:
        for file_path in DIST_DIR.rglob(pattern):
            if file_path.is_file():
                file_path.unlink()
                removed_count += 1
            elif file_path.is_dir():
                shutil.rmtree(file_path)
                removed_count += 1
    
    print_success(f"Removed {removed_count} unnecessary files")

def get_size(path):
    """Get size of directory or file in MB"""
    if path.is_file():
        return path.stat().st_size / (1024 * 1024)
    
    total = 0
    for f in path.rglob('*'):
        if f.is_file():
            total += f.stat().st_size
    return total / (1024 * 1024)

def print_summary():
    """Print build summary"""
    print_step("Build Summary")
    
    exe_path = DIST_DIR / ("edgesoul-backend.exe" if sys.platform == "win32" else "edgesoul-backend")
    
    if exe_path.exists():
        exe_size = get_size(exe_path)
        print(f"  Executable: {exe_path.name} ({exe_size:.1f} MB)")
    
    if DIST_DIR.exists():
        total_size = get_size(DIST_DIR)
        print(f"  Total dist size: {total_size:.1f} MB")
    
    print(f"\n{Colors.GREEN}{'='*50}")
    print(f"✅ Backend packaged successfully!")
    print(f"{'='*50}{Colors.END}")
    print(f"Output: {DIST_DIR}")
    print(f"\nTo test the backend:")
    print(f"  cd {DIST_DIR}")
    print(f"  ./edgesoul-backend")

def main():
    """Main build process"""
    print(f"{Colors.BLUE}{'='*50}")
    print("EdgeSoul Backend Packaging")
    print(f"{'='*50}{Colors.END}\n")
    
    # Change to backend directory
    os.chdir(BACKEND_DIR)
    
    try:
        check_requirements()
        clean_previous_builds()
        spec_file = create_spec_file()
        build_executable(spec_file)
        copy_models()
        optimize_size()
        print_summary()
        
    except Exception as e:
        print_error(f"Build failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
