/* global archipelago */

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path                                         = require('path')
const url                                          = require('url')
const AppMenu                                      = require('./app_menu')
const isDev                                        = require('electron-is-dev')
const Config                                       = require('../config')

const settings   = null
const about      = null
const windows    = []

global.archipelago = { config: new Config }

if (!isDev) {
  require('update-electron-app')()
}

const resetApplicationMenu = () =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(AppMenu.menu(about, settings, createWindow))
  )


var createWindow = function() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: ((process.platform === 'darwin') && 'hiddenInset') || 'hidden',
    frame: process.platform === 'darwin',
    vibrancy: archipelago.config.get('vibrancy')
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../renderer/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.focus()

  return windows.push(win)
}

app.on('ready', function() {
  createWindow()
  resetApplicationMenu()
  if (process.platform === 'darwin') {
    return app.dock.setMenu(Menu.buildFromTemplate(AppMenu.dock(createWindow)))
  }
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') { return app.quit() }
})

app.on('activate', function() {
  let windowCount = 0
  windows.forEach(function(win) {
    if (!win.isDestroyed()) { return windowCount += 1 }
  })

  if (windowCount === 0) { return createWindow() }
})

archipelago.config.onDidChange('vibrancy', value =>
  windows.forEach(function(win) {
    if (!win.isDestroyed()) { return win.setVibrancy(value) }
  })
)

archipelago.config.onDidChange('singleTabMode', resetApplicationMenu)
archipelago.config.onActiveProfileChange(resetApplicationMenu)

ipcMain.on('open-hamburger-menu', (ev, args) => Menu.getApplicationMenu().popup(args))
