import {BrowserWindow} from 'electron'
import {is} from 'electron-util'

let settingsWindow = null

export default () => {
  if ((settingsWindow === null) || settingsWindow.isDestroyed()) {
    settingsWindow = new BrowserWindow({
      width: 600,
      height: 600,
      show: false,
      titleBarStyle: 'hiddenInset',
      frame: is.macos,
      backgroundColor: '#fff',
      webPreferences: {experimentalFeatures: true}
    })

    if (is.development) {
      settingsWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#settings`)
    } else {
      settingsWindow.loadURL(`file:///${__dirname}/index.html#settings`)
    }

    settingsWindow.once('ready-to-show', () => settingsWindow.show())
  } else {
    settingsWindow.focus()
  }
}
