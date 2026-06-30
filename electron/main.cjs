const { app, BrowserWindow, Menu, Tray, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { execFile } = require('child_process');
const { createNeteaseService } = require('./netease-service.cjs');

const isDev = !app.isPackaged;
const appUrl = isDev
  ? process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173'
  : pathToFileURL(path.join(__dirname, '../dist/index.html')).toString();

let mainWindow = null;
let wallpaperWindow = null;
let tray = null;
let lastWallpaperOptions = null;
let isQuitting = false;
let neteaseService = null;
let neteaseApiBase = '';

const defaultWallpaperOptions = {
  scene: 'still',
  quoteId: 0,
  lowPower: false,
  passThroughMouse: false,
  autoMusic: true
};

const normalizeWallpaperOptions = (options = {}) => ({
  ...defaultWallpaperOptions,
  ...options,
  lowPower: Boolean(options.lowPower),
  passThroughMouse: Boolean(options.passThroughMouse),
  autoMusic: options.autoMusic !== false
});

const state = () => ({
  wallpaperActive: Boolean(wallpaperWindow && !wallpaperWindow.isDestroyed()),
  launchAtLogin: app.getLoginItemSettings().openAtLogin,
  platform: process.platform,
  mainWindowMaximized: Boolean(mainWindow && !mainWindow.isDestroyed() && mainWindow.isMaximized()),
  neteaseApiBase,
  wallpaperOptions: lastWallpaperOptions || defaultWallpaperOptions
});

const broadcastState = () => {
  const payload = state();
  BrowserWindow.getAllWindows().forEach(window => {
    window.webContents.send('desktop:state-changed', payload);
  });
};

const loadApp = async (window, query = '') => {
  if (isDev) {
    await window.loadURL(`${appUrl}${query}`);
    return;
  }
  await window.loadURL(`${appUrl}${query}`);
};

const wallpaperQuery = (options) => {
  const params = new URLSearchParams({
    wallpaper: '1',
    scene: options.scene || defaultWallpaperOptions.scene,
    quoteId: String(options.quoteId || 0),
    lowPower: options.lowPower ? '1' : '0',
    autoMusic: options.autoMusic ? '1' : '0'
  });
  return `?${params.toString()}`;
};

const createMainWindow = async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 620,
    title: '聞言',
    frame: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    backgroundColor: '#111312',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.on('maximize', broadcastState);
  mainWindow.on('unmaximize', broadcastState);
  mainWindow.on('restore', broadcastState);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await loadApp(mainWindow);
  return mainWindow;
};

const createWallpaperWindow = async (options = {}) => {
  const wallpaperOptions = normalizeWallpaperOptions(options);
  if (wallpaperWindow && !wallpaperWindow.isDestroyed()) {
    wallpaperWindow.close();
  }

  const displays = screen.getAllDisplays();
  const bounds = displays.reduce((acc, display) => ({
    x: Math.min(acc.x, display.bounds.x),
    y: Math.min(acc.y, display.bounds.y),
    right: Math.max(acc.right, display.bounds.x + display.bounds.width),
    bottom: Math.max(acc.bottom, display.bounds.y + display.bounds.height)
  }), {
    x: displays[0].bounds.x,
    y: displays[0].bounds.y,
    right: displays[0].bounds.x + displays[0].bounds.width,
    bottom: displays[0].bounds.y + displays[0].bounds.height
  });

  wallpaperWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.right - bounds.x,
    height: bounds.bottom - bounds.y,
    frame: false,
    transparent: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    show: false,
    focusable: false,
    hasShadow: false,
    title: '聞言动态壁纸',
    backgroundColor: '#111312',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  wallpaperWindow.setMenuBarVisibility(false);
  wallpaperWindow.setIgnoreMouseEvents(wallpaperOptions.passThroughMouse, { forward: true });
  wallpaperWindow.on('closed', () => {
    wallpaperWindow = null;
    broadcastState();
  });

  await loadApp(wallpaperWindow, wallpaperQuery(wallpaperOptions));
  wallpaperWindow.showInactive();
  wallpaperWindow.setAlwaysOnTop(false);
  wallpaperWindow.moveBottom();
  await attachToDesktop(wallpaperWindow);
  lastWallpaperOptions = wallpaperOptions;
  broadcastState();
  return state();
};

const attachToDesktop = async (window) => {
  if (process.platform !== 'win32') {
    window.setFullScreen(true);
    return;
  }

  const hwndBuffer = window.getNativeWindowHandle();
  const hwnd = hwndBuffer.readUInt32LE(0);
  const unpackedScript = path.join(process.resourcesPath, 'app.asar.unpacked', 'electron', 'win-wallpaper.ps1');
  const script = app.isPackaged && !process.defaultApp && require('fs').existsSync(unpackedScript)
    ? unpackedScript
    : path.join(__dirname, 'win-wallpaper.ps1');

  await new Promise((resolve, reject) => {
    execFile('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      script,
      String(hwnd)
    ], {
      windowsHide: true,
      timeout: 8000
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || stdout || error.message));
        return;
      }
      resolve();
    });
  });
};

const exitWallpaperMode = () => {
  if (wallpaperWindow && !wallpaperWindow.isDestroyed()) {
    wallpaperWindow.close();
  }
  wallpaperWindow = null;
  broadcastState();
  return state();
};

const createTray = () => {
  if (tray) return;

  const icon = nativeImage.createFromPath(path.join(__dirname, '../public/favicon.ico'));
  tray = new Tray(icon);
  tray.setToolTip('聞言动态壁纸');
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: '打开控制台',
      click: () => createMainWindow()
    },
    {
      label: '设为动态桌面壁纸',
      click: () => createWallpaperWindow(lastWallpaperOptions || {})
    },
    {
      label: '退出壁纸模式',
      click: () => exitWallpaperMode()
    },
    { type: 'separator' },
    {
      label: '退出聞言',
      click: () => {
        isQuitting = true;
        exitWallpaperMode();
        app.quit();
      }
    }
  ]));
};

const startNeteaseService = async () => {
  if (neteaseApiBase || neteaseService) return;
  try {
    neteaseService = createNeteaseService({
      userDataPath: app.getPath('userData')
    });
    neteaseApiBase = await neteaseService.start();
    broadcastState();
  } catch (error) {
    console.warn('[WenYan] Failed to start Netease service:', error.message);
    neteaseService = null;
    neteaseApiBase = '';
  }
};

ipcMain.handle('desktop:get-state', () => state());
ipcMain.handle('desktop:set-wallpaper-mode', (_event, options) => createWallpaperWindow(options));
ipcMain.handle('desktop:exit-wallpaper-mode', () => exitWallpaperMode());
ipcMain.handle('desktop:window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
  return state();
});
ipcMain.handle('desktop:window-toggle-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
  broadcastState();
  return state();
});
ipcMain.handle('desktop:window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
  return state();
});
ipcMain.handle('desktop:set-launch-at-login', (_event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled)
  });
  broadcastState();
  return state();
});

app.whenReady().then(async () => {
  await startNeteaseService();
  createTray();
  await createMainWindow();
  if (app.getLoginItemSettings().openAtLogin) {
    await createWallpaperWindow(lastWallpaperOptions || {});
  }
});

app.on('activate', () => {
  createMainWindow();
});

app.on('window-all-closed', (event) => {
  if (isQuitting) return;
  event.preventDefault();
  if (mainWindow) {
    mainWindow.hide();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (wallpaperWindow && !wallpaperWindow.isDestroyed()) {
    wallpaperWindow.destroy();
  }
  if (neteaseService) {
    neteaseService.close().catch(() => {});
  }
});
