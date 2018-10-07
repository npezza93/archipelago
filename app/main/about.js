const {BrowserWindow} = require('electron')
const {is} = require('electron-util')

let aboutWindow = null

exports.display = () => {
  if (aboutWindow === null || aboutWindow.isDestroyed()) {
    aboutWindow = new BrowserWindow({
      width: 300,
      height: 500,
      show: true,
      titleBarStyle: 'hiddenInset',
      frame: is.macos
    })

    if (is.development) {
      aboutWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#about`)
    } else {
      aboutWindow.loadFile('dist/renderer/index.html#about')
    }
  }

  aboutWindow.focus()
}
