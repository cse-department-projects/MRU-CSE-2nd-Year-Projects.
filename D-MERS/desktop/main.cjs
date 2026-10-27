const { app, BrowserWindow, shell, dialog, Menu, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

const isDev = process.env.NODE_ENV === 'development';

// Register custom protocol dmers:// for OAuth callbacks
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('dmers', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('dmers');
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;
let splashWindow = null;
let pendingAuthUrl = null;

// Helper to extract dmers:// URL from argument arrays, stripping quotes and flags
function extractProtocolUrl(args) {
  if (!Array.isArray(args)) return null;
  for (const arg of args) {
    if (typeof arg !== 'string') continue;
    const cleaned = arg.trim().replace(/^["']|["']$/g, '');
    if (cleaned.startsWith('dmers://')) {
      return cleaned;
    }
  }
  return null;
}

// Check cold start invocation with dmers:// URL
const coldStartUrl = extractProtocolUrl(process.argv);
if (coldStartUrl) {
  console.log('[D-MERS Main] Cold start protocol URL captured.');
  pendingAuthUrl = coldStartUrl;
}

// IPC handler so renderer can pull pending OAuth URL on initial mount
ipcMain.handle('get-pending-oauth-url', () => {
  const url = pendingAuthUrl;
  pendingAuthUrl = null;
  if (url) {
    console.log('[D-MERS Main] Delivering queued OAuth callback to renderer via pull.');
  }
  return url;
});

function sendAuthUrlToRenderer(url) {
  if (!url || !url.startsWith('dmers://')) return;
  console.log('[D-MERS Main] Delivering OAuth callback to renderer.');
  pendingAuthUrl = url;

  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
    }
    mainWindow.webContents.send('oauth-callback', url);
  }
}

// Production loopback fallback server on port 3000
// Catches any residual http://localhost:3000/#access_token=... redirects from Supabase
// and automatically forwards the tokens to the dmers:// custom protocol in Edge/Chrome.
let loopbackServer = null;
function startLoopbackServer() {
  if (isDev) return;
  try {
    loopbackServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>D-MERS Authentication</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F8FAFC; color: #0F172A; text-align: center; }
    .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.06); max-width: 420px; border: 1px solid #E2E8F0; }
    h2 { color: #1E3A8A; margin: 0 0 0.5rem 0; font-size: 1.5rem; }
    p { color: #64748B; font-size: 0.9rem; margin: 0; }
    .spinner { width: 32px; height: 32px; border: 3px solid #E2E8F0; border-top-color: #1E3A8A; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 1.25rem auto 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <h2>D-MERS Authenticated</h2>
    <p>Returning you to the D-MERS application...</p>
    <div class="spinner"></div>
  </div>
  <script>
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    window.location.href = 'dmers://auth/callback' + search + hash;
    setTimeout(() => { window.close(); }, 2000);
  </script>
</body>
</html>`);
    });

    loopbackServer.listen(3000, '127.0.0.1', () => {
      console.log('[D-MERS Main] OAuth loopback listening on http://127.0.0.1:3000');
    });

    loopbackServer.on('error', (err) => {
      console.warn('[D-MERS Main] Loopback server notice:', err.message);
    });
  } catch (err) {
    console.warn('[D-MERS Main] Could not start loopback server:', err);
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 540,
    transparent: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    backgroundColor: '#1E3A8A',
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false
    }
  });

  const splashFile = path.join(__dirname, 'splash.html');
  splashWindow.loadFile(splashFile);
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#F8FAFC',
    title: 'D-MERS',
    icon: path.join(__dirname, 'icons', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true,
      devTools: isDev
    }
  });

  Menu.setApplicationMenu(null);

  // Load the React app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Handle external links (Google OAuth) — open in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith('https://accounts.google.com') ||
      url.startsWith('https://') ||
      url.startsWith('http://')
    ) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Intercept navigations to external URLs
  mainWindow.webContents.on('will-navigate', (event, navUrl) => {
    const parsedUrl = new URL(navUrl);
    if (parsedUrl.protocol === 'file:') return;
    if (isDev && parsedUrl.hostname === 'localhost') return;
    event.preventDefault();
    shell.openExternal(navUrl);
  });

  // Show main window once loaded
  mainWindow.once('ready-to-show', () => {
    const showMain = () => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
      mainWindow.focus();

      if (pendingAuthUrl) {
        setTimeout(() => {
          sendAuthUrlToRenderer(pendingAuthUrl);
        }, 300);
      }
    };

    setTimeout(showMain, 2000);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingAuthUrl) {
      setTimeout(() => {
        sendAuthUrlToRenderer(pendingAuthUrl);
      }, 500);
    }
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'D-MERS — Application Error',
      message: 'Something went wrong',
      detail: 'The application encountered an unexpected error.\nPlease relaunch D-MERS.',
      buttons: ['Relaunch', 'Exit']
    });
    app.relaunch();
    app.exit(0);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle second instance (when Windows opens dmers:// URL while app is already running)
app.on('second-instance', (event, commandLine) => {
  console.log('[D-MERS Main] Second instance event triggered.');
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }

  const protocolUrl = extractProtocolUrl(commandLine);
  if (protocolUrl) {
    console.log('[D-MERS Main] Protocol URL detected in second instance.');
    sendAuthUrlToRenderer(protocolUrl);
  } else {
    console.log('[D-MERS Main] No protocol URL found in second-instance arguments.');
  }
});

app.whenReady().then(() => {
  startLoopbackServer();
  createSplashWindow();
  setTimeout(createMainWindow, 300);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (loopbackServer) {
    try { loopbackServer.close(); } catch (_) {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  console.error('[D-MERS Main] Uncaught exception:', error);
  dialog.showErrorBox('D-MERS Error', 'An unexpected error occurred. The application will restart.');
  app.relaunch();
  app.exit(1);
});
