const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getPendingOAuthUrl: () => ipcRenderer.invoke('get-pending-oauth-url'),
  onOAuthCallback: (callback) => {
    const listener = (_event, url) => {
      callback(url);
    };
    ipcRenderer.on('oauth-callback', listener);
    return () => {
      ipcRenderer.removeListener('oauth-callback', listener);
    };
  }
});
