const {BrowserWindow} = require('electron')

let settingsWindow = null

exports.display = () => {
  if ((settingsWindow === null) || settingsWindow.isDestroyed()) {
    settingsWindow = new BrowserWindow({
      width: 600,
      height: 600,
      show: true,
      titleBarStyle: 'hiddenInset',
      frame: process.platform === 'darwin',
      webPreferences: {experimentalFeatures: true}
    })

    settingsWindow.loadFile('app/settings/index.html')
  }

  settingsWindow.focus()
}
