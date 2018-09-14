const {BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

let aboutWindow = null

module.exports = {
  display() {
    if ((aboutWindow === null) || aboutWindow.isDestroyed()) {
      aboutWindow = new BrowserWindow({
        width: 300,
        height: 500,
        show: true,
        titleBarStyle: 'hiddenInset',
        frame: process.platform === 'darwin',
        icon: path.join(__dirname, '../../../build/icon.png')
      })

      aboutWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../about/index.html'),
        protocol: 'file:',
        slashes: true
      }))
    }

    return aboutWindow.focus()
  }
}
