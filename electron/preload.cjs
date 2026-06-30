const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wenyanDesktop', {
  getState: () => ipcRenderer.invoke('desktop:get-state'),
  setWallpaperMode: (options) => ipcRenderer.invoke('desktop:set-wallpaper-mode', options),
  exitWallpaperMode: () => ipcRenderer.invoke('desktop:exit-wallpaper-mode'),
  minimizeWindow: () => ipcRenderer.invoke('desktop:window-minimize'),
  toggleMaximizeWindow: () => ipcRenderer.invoke('desktop:window-toggle-maximize'),
  closeWindow: () => ipcRenderer.invoke('desktop:window-close'),
  setLaunchAtLogin: (enabled) => ipcRenderer.invoke('desktop:set-launch-at-login', enabled),
  onStateChanged: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('desktop:state-changed', listener);
    return () => ipcRenderer.removeListener('desktop:state-changed', listener);
  }
});
