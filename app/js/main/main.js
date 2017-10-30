require('coffeescript').register()
const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')
const url = require('url')
const AppMenu = require('./app_menu')

const ConfigFile = require('../config_file')

let settings
let windows = []
let configFile = new ConfigFile()

function createWindow () {
  let win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: 'hidden-inset',
    vibrancy: configFile.contents().vibrancy
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../../index.html'),
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
  enableLiveReload()
  if (windows.length === 0) {
    createWindow()
  }
})

configFile.on('change', () => {
  windows.forEach((win) => {
    win.setVibrancy(configFile.contents().vibrancy)
  })
})
