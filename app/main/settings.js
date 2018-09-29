const {BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let settingsWindow = null

module.exports = {
  display() {
    if ((settingsWindow === null) || settingsWindow.isDestroyed()) {
      settingsWindow = new BrowserWindow({
        width: 600,
        height: 600,
        show: true,
        titleBarStyle: 'hiddenInset',
        frame: process.platform === 'darwin',
        icon: path.join(__dirname, '../../../build/icon.png'),
        webPreferences: {
          blinkFeatures: 'CSSBackdropFilter'
        }
      })

      settingsWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../settings/index.html'),
        protocol: 'file:',
        slashes: true
      }))
    }

    return settingsWindow.focus()
  }
}
