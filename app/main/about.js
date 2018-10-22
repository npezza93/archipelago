import {BrowserWindow} from 'electron'
import {is, darkMode} from 'electron-util'

let aboutWindow = null

export default () => {
  if (aboutWindow === null || aboutWindow.isDestroyed()) {
    aboutWindow = new BrowserWindow({
      width: 300,
      height: 500,
      show: false,
      titleBarStyle: 'hiddenInset',
      backgroundColor: darkMode.isEnabled ? '#393736' : '#F5F5F5',
      frame: is.macos
    })

    if (is.development && process.env.ELECTRON_WEBPACK_WDS_PORT) {
      aboutWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#about`)
    } else if (process.env.NODE_ENV === 'test') {
      aboutWindow.loadURL(`file://${__dirname}/../renderer/index.html#about`)
    } else {
      aboutWindow.loadURL(`file:///${__dirname}/index.html#about`)
    }

    if (is.development) {
      aboutWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#about`)
    } else {
      aboutWindow.loadURL(`file:///${__dirname}/index.html#about`)
    }

    aboutWindow.once('ready-to-show', () => aboutWindow.show())
  } else {
    aboutWindow.focus()
  }
}
