const {contextBridge} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipc: require('electron-better-ipc').ipcRenderer
});
