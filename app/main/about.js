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

    aboutWindow.loadFile('app/about/index.html')
  }

  aboutWindow.focus()
}
