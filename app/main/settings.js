import {BrowserWindow, systemPreferences} from 'electron'
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
      backgroundColor: systemPreferences.isDarkMode() ? '#393736' : '#F5F5F5',
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
