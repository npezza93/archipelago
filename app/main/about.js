import {BrowserWindow} from 'electron'
import {is} from 'electron-util'

let aboutWindow = null

export default () => {
  if (aboutWindow === null || aboutWindow.isDestroyed()) {
    aboutWindow = new BrowserWindow({
      width: 300,
      height: 500,
      show: false,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#fff',
      frame: is.macos
    })

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
