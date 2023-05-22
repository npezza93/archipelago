const {contextBridge} = require('electron');
const mouseConstructor = require('osx-mouse');
const {getCurrentWindow} = require('@electron/remote');

const setPosition = (x, y) => {
  getCurrentWindow().setPosition(x + 0, y + 0)
};
let offset = null;
const mouse = mouseConstructor();

mouse.on('left-drag', (x, y) => {
  if (!offset) return

  x = Math.round(x - offset[0])
  y = Math.round(y - offset[1])

  setPosition(x, y)
})

mouse.on('left-up', () => {
  offset = null;
});

contextBridge.exposeInMainWorld('electron', {
  ipc: require('electron-better-ipc').ipcRenderer,
  setPosition: setPosition,
  setOffset: (value) => {
    offset = value;
  }
});
