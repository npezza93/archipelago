/* global archipelago */

const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev')
const AppMenu = require('./app-menu')

const settings = null
const about = null
const windows = []

global.archipelago = require('../global')

if (!isDev) {
  require('update-electron-app')()
}

const resetApplicationMenu = () =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(AppMenu.menu(about, settings, createWindow))
  )

const createWindow = () => {
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

app.on('ready', () => {
  createWindow()
  resetApplicationMenu()
  if (process.platform === 'darwin') {
    return app.dock.setMenu(Menu.buildFromTemplate(AppMenu.dock(createWindow)))
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    return app.quit()
  }
})

app.on('activate', () => {
  let windowCount = 0
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      windowCount += 1
      return windowCount
    }
  })

  if (windowCount === 0) {
    return createWindow()
  }
})

archipelago.config.onDidChange('vibrancy', value =>
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      return win.setVibrancy(value)
    }
  })
)

archipelago.config.onDidChange('singleTabMode', resetApplicationMenu)
archipelago.profileManager.onActiveProfileChange(resetApplicationMenu)

ipcMain.on('open-hamburger-menu', (ev, args) => Menu.getApplicationMenu().popup(args))
