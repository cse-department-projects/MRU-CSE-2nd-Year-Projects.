const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Disable default menu in production
const isDev = process.env.NODE_ENV === 'development';

// Enable crash reports in production
if (!isDev) {
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
}

let mainWindow = null;
let splashWindow = null;

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
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashPath = path.join(__dirname, 'splash.html');
  splashWindow.loadFile(splashPath);
  splashWindow.show();
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    backgroundColor: '#F8FAFC',
    title: 'D-MERS — Disaster Management & Emergency Response System',
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Load the Vite production build
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(indexPath);
  }

  // Hide the menu bar
  mainWindow.setMenuBarVisibility(false);

  // Open external links in system browser (for Google OAuth)
  mainWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    if (openUrl.startsWith('https://accounts.google.com') ||
        openUrl.startsWith('https://supabase.co') ||
        openUrl.startsWith('http://localhost')) {
      shell.openExternal(openUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Show main window after it loads
  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      // Keep splash visible for at least 2 seconds
      setTimeout(() => {
        if (splashWindow && !splashWindow.isDestroyed()) {
          splashWindow.close();
          splashWindow = null;
        }
        mainWindow.show();
        mainWindow.focus();
      }, 2200);
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle renderer crash gracefully
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer crashed:', details);
    dialog.showMessageBox({
      type: 'error',
      title: 'D-MERS',
      message: 'Something went wrong',
      detail: 'The application encountered an error. Please relaunch D-MERS.',
      buttons: ['Relaunch', 'Exit'],
    }).then(({ response }) => {
      if (response === 0) {
        app.relaunch();
      }
      app.exit();
    });
  });
}

app.whenReady().then(() => {
  createSplashWindow();

  // Small delay before creating the main window
  setTimeout(createMainWindow, 300);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security best practices - disable remote module
app.on('remote-get-builtin', (event) => event.preventDefault());
app.on('remote-get-global', (event) => event.preventDefault());
app.on('remote-get-current-window', (event) => event.preventDefault());
app.on('remote-get-current-web-contents', (event) => event.preventDefault());
