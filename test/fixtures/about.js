const { app }           = require('electron')
const { BrowserWindow } = require('electron')
const path              = require('path')
const url               = require('url')

let about = null

app.on('ready', function () {
  about = new BrowserWindow({
    width: 300,
    height: 500,
    show: true,
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin'
  })

  about.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/about/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  about.on('closed', function () { about = null })
})
