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

    settingsWindow.loadFile('app/settings/index.html')
  }

  settingsWindow.focus()
}
