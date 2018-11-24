import {BrowserWindow, app} from 'electron'
import {is, darkMode} from 'electron-util'
import ipc from 'electron-better-ipc'

let settingsWindow = null

export default () => {
  if ((settingsWindow === null) || settingsWindow.isDestroyed()) {
    settingsWindow = new BrowserWindow({
      width: 600,
      height: 600,
      show: false,
      titleBarStyle: 'hiddenInset',
      frame: is.macos,
      backgroundColor: darkMode.isEnabled ? '#393736' : '#F5F5F5',
      webPreferences: {experimentalFeatures: true}
    })

    if (is.development && process.env.ELECTRON_WEBPACK_WDS_PORT) {
      settingsWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#settings`)
    } else if (is.development && !process.env.ELECTRON_WEBPACK_WDS_PORT) {
      settingsWindow.loadURL(`file://${__dirname}/../renderer/index.html#settings`)
    } else {
      settingsWindow.loadURL(`file:///${__dirname}/index.html#settings`)
    }

    settingsWindow.once('close', e => {
      e.preventDefault()
      ipc.callRenderer(settingsWindow, 'close').then(() => {
        settingsWindow.hide()
        settingsWindow.destroy()
      })
    })

    settingsWindow.once('ready-to-show', () => settingsWindow.show())
  } else {
    settingsWindow.focus()
  }
}

app.on('before-quit', () => {
  if ((settingsWindow !== null) && !settingsWindow.isDestroyed()) {
    settingsWindow.removeAllListeners('close')
  }
})
