const {BrowserWindow} = require('electron')

let aboutWindow = null

exports.display = () => {
  if ((aboutWindow === null) || aboutWindow.isDestroyed()) {
    aboutWindow = new BrowserWindow({
      width: 300,
      height: 500,
      show: true,
      titleBarStyle: 'hiddenInset',
      frame: process.platform === 'darwin'
    })

    aboutWindow.loadFile('app/about/index.html')
  }

  aboutWindow.focus()
}
