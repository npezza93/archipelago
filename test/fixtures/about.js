const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const {is} = require('electron-util')

let about = null

app.on('ready', () => {
  about = new BrowserWindow({
    width: 300,
    height: 500,
    show: true,
    titleBarStyle: 'hiddenInset',
    frame: is.macos
  })

  about.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/about/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  about.on('closed', () => {
    about = null
  })
})
