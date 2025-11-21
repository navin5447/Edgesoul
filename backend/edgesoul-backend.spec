# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

# Add all Python files
a = Analysis(
    ['main.py'],
    pathex=[r'C:\Users\Navinkumar\Downloads\Edgesoul\backend'],
    binaries=[],
    datas=[
        (r'C:\Users\Navinkumar\Downloads\Edgesoul\backend/models', 'models'),
        (r'C:\Users\Navinkumar\Downloads\Edgesoul\backend/core', 'core'),
        (r'C:\Users\Navinkumar\Downloads\Edgesoul\backend/services', 'services'),
        (r'C:\Users\Navinkumar\Downloads\Edgesoul\backend/api', 'api'),
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
    hooksconfig={},
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
