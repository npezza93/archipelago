const {BrowserWindow} = require('electron')
const {is} = require('electron-util')

let settingsWindow = null

exports.display = () => {
  if ((settingsWindow === null) || settingsWindow.isDestroyed()) {
    settingsWindow = new BrowserWindow({
      width: 600,
      height: 600,
      show: true,
      titleBarStyle: 'hiddenInset',
      frame: is.macos,
      webPreferences: {experimentalFeatures: true}
    })

    if (is.development) {
      settingsWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#settings`)
    } else {
      settingsWindow.loadFile('dist/renderer/index.html#settings')
    }
  }

  settingsWindow.focus()
}
