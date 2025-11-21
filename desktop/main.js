/**
 * EdgeSoul Desktop - Main Process
 * Handles app lifecycle, backend server, and native features
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, shell, dialog, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Initialize persistent store
const store = new Store();

// Global references
let mainWindow = null;
let tray = null;
let backendProcess = null;
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
const BACKEND_PORT = 8000;
const FRONTEND_PORT = 3000;

// Disable GPU acceleration to avoid crashes on some systems
app.disableHardwareAcceleration();

/**
 * Create main application window
 */
function createWindow() {
  // Get saved window bounds or use defaults
  const windowBounds = store.get('windowBounds', {
    width: 1200,
    height: 800
  });

  mainWindow = new BrowserWindow({
    ...windowBounds,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'resources', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    backgroundColor: '#0f172a',
    show: false, // Show after ready-to-show
    autoHideMenuBar: true,
    title: 'EdgeSoul - Your Emotional AI Companion'
  });

  // Save window bounds on resize/move
  mainWindow.on('resize', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  mainWindow.on('move', () => {
    store.set('windowBounds', mainWindow.getBounds());
  });

  // Load frontend - Always use frontend port (Next.js serves the UI)
  const startUrl = `http://localhost:${FRONTEND_PORT}`;

  // Show loading message
  const loadingHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Loading EdgeSoul...</title>
      </head>
      <body style="margin:0;padding:0;background:#1e293b;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui">
        <div style="text-align:center;color:#fff">
          <h1 style="font-size:2em;margin-bottom:0.5em">🚀 Loading EdgeSoul...</h1>
          <p style="color:#94a3b8;font-size:1.2em">Please wait while we connect to the frontend...</p>
          <div style="margin-top:2em">
            <div style="width:200px;height:4px;background:#334155;border-radius:2px;margin:0 auto;overflow:hidden">
              <div style="width:100%;height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);animation:loading 1.5s infinite"></div>
            </div>
          </div>
          <style>
            @keyframes loading { 
              0% { transform: translateX(-100%); } 
              100% { transform: translateX(100%); } 
            }
          </style>
        </div>
      </body>
    </html>
  `;

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(loadingHTML));

  // Wait for frontend to be ready with polling
  const checkFrontend = async () => {
    const http = require('http');
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const req = http.get(`http://localhost:${FRONTEND_PORT}`, (res) => {
          if (res.statusCode === 200) {
            clearInterval(checkInterval);
            resolve(true);
          }
        });
        
        req.on('error', () => {
          // Frontend not ready yet, keep checking
        });
        
        req.end();
      }, 1000); // Check every second
      
      // Give up after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 30000);
    });
  };

  // Wait for frontend, then load it
  checkFrontend().then((ready) => {
    if (ready) {
      console.log('Frontend is ready, loading...');
      mainWindow.loadURL(startUrl).catch(err => {
        console.error('Failed to load frontend:', err);
      });
    } else {
      console.log('Frontend not ready after 30s, loading anyway...');
      mainWindow.loadURL(startUrl).catch(err => {
        console.error('Failed to load frontend:', err);
      });
    }
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development mode or if loading failed
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    
    // Show error page with retry option
    const errorHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connection Failed</title>
        </head>
        <body style="margin:0;padding:0;background:#1e293b;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui">
          <div style="text-align:center;color:#fff;max-width:500px;padding:2em">
            <h1 style="font-size:2em;margin-bottom:0.5em;color:#ef4444">⚠️ Connection Failed</h1>
            <p style="color:#94a3b8;font-size:1.1em;margin-bottom:2em">
              Could not connect to EdgeSoul frontend.<br/>
              Make sure the frontend server is running on port ${FRONTEND_PORT}.
            </p>
            <button onclick="location.reload()" style="background:#6366f1;color:#fff;border:none;padding:12px 24px;font-size:1em;border-radius:6px;cursor:pointer">
              Retry Connection
            </button>
            <p style="color:#64748b;font-size:0.9em;margin-top:2em">
              Or press <strong>Ctrl+R</strong> to reload
            </p>
          </div>
        </body>
      </html>
    `;
    
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHTML));
    
    // Auto-retry after 5 seconds
    setTimeout(() => {
      mainWindow.loadURL(startUrl);
    }, 5000);
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // Show notification on first minimize
      if (!store.get('hasSeenTrayNotification')) {
        tray.displayBalloon({
          title: 'EdgeSoul is still running',
          content: 'Click the tray icon to restore the window'
        });
        store.set('hasSeenTrayNotification', true);
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

/**
 * Create system tray
 */
function createTray() {
  // Use icon.ico for tray
  const trayIconPath = path.join(__dirname, 'resources', 'icon.ico');
  tray = new Tray(trayIconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show EdgeSoul',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'New Conversation',
      accelerator: 'CommandOrControl+N',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('new-conversation');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('open-settings');
        }
      }
    },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdatesAndNotify();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit EdgeSoul',
      accelerator: 'CommandOrControl+Q',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('EdgeSoul - Your AI Companion');
  tray.setContextMenu(contextMenu);

  // Double click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

/**
 * Start FastAPI backend server
 */
function startBackend() {
  return new Promise((resolve, reject) => {
    // In development, assume backend is already running
    if (isDev) {
      console.log('Development mode: Assuming backend is already running on port', BACKEND_PORT);
      resolve();
      return;
    }

    // Production: Start the bundled backend
    const backendPath = path.join(process.resourcesPath, 'backend');
    const backendExe = path.join(backendPath, process.platform === 'win32'
      ? 'edgesoul-backend.exe'
      : 'edgesoul-backend');

    console.log(`Starting backend from: ${backendPath}`);
    console.log(`Backend command: ${backendExe}`);

    try {
      backendProcess = spawn(backendExe, [], {
        cwd: backendPath,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1'
        }
      });

      backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
        
        // Check if server started successfully
        if (data.toString().includes('Application startup complete')) {
          console.log('✅ Backend server started successfully');
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
      });

      backendProcess.on('error', (error) => {
        console.error('Failed to start backend:', error);
        reject(error);
      });

      backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
        if (code !== 0 && code !== null) {
          reject(new Error(`Backend exited with code ${code}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!backendProcess.killed) {
          resolve(); // Continue anyway, might be slow startup
        }
      }, 30000);

    } catch (error) {
      console.error('Error spawning backend process:', error);
      reject(error);
    }
  });
}

/**
 * Stop backend server
 */
function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend server...');
    backendProcess.kill();
    backendProcess = null;
  }
}

/**
 * Setup auto-updater
 */
function setupAutoUpdater() {
  if (isDev) {
    console.log('Skipping auto-updater in development mode');
    return;
  }

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version of EdgeSoul is available. It will be downloaded in the background.',
      buttons: ['OK']
    });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded. Restart EdgeSoul to apply the update.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Check for updates every 6 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 6 * 60 * 60 * 1000);
}

/**
 * Register global shortcuts
 */
function registerShortcuts() {
  // Quick toggle window
  globalShortcut.register('CommandOrControl+Shift+E', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  // New conversation
  globalShortcut.register('CommandOrControl+N', () => {
    if (mainWindow) {
      mainWindow.webContents.send('new-conversation');
    }
  });

  // Reload app (useful for development and fixing blank screens)
  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });

  // Force reload (clear cache)
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) {
      mainWindow.webContents.reloadIgnoringCache();
    }
  });
}

// ============================================================================
// IPC Handlers
// ============================================================================

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-backend-url', () => {
  return `http://localhost:${BACKEND_PORT}`;
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-notification', (event, options) => {
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', options);
  }
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdatesAndNotify();
});

// ============================================================================
// App Lifecycle
// ============================================================================

app.on('ready', async () => {
  console.log('🚀 EdgeSoul Desktop starting...');

  try {
    // Start backend server first
    console.log('Starting backend server...');
    await startBackend();

    // Create window and tray
    createWindow();
    createTray();

    // Setup shortcuts and updater
    registerShortcuts();
    setupAutoUpdater();

    console.log('✅ EdgeSoul Desktop ready!');
  } catch (error) {
    console.error('Failed to start EdgeSoul:', error);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start EdgeSoul backend:\n\n${error.message}\n\nPlease make sure all dependencies are installed.`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Don't quit on window close (run in tray)
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
  stopBackend();
});

app.on('will-quit', () => {
  stopBackend();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  dialog.showErrorBox('Error', error.message);
});
