const {app} = require('electron')
const {BrowserWindow} = require('electron')

let about = null

app.on('ready', () => {
  about = new BrowserWindow({
    width: 300,
    height: 500,
    show: true,
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin'
  })

  about.loadFile('app/about/index.html')

  about.on('closed', () => {
    about = null
  })
})
