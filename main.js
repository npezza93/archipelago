const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const url = require('url')
const ConfigFile = require(path.join(__dirname, '/app/js/config_file'))
const AppMenu = require(path.join(__dirname, '/app/js/app_menu'))

let settings
let windows = []
let configFile = new ConfigFile()

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: 'hidden-inset',
    vibrancy: configFile.contents.vibrancy
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.focus()

  windows.push(win)
}

app.on('ready', () => {
  createWindow()
  Menu.setApplicationMenu(Menu.buildFromTemplate(AppMenu.menu(settings, createWindow)))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

configFile.on('change', () => {
  windows.forEach((win) => {
    win.setVibrancy(configFile.contents.vibrancy)
  })
})
