const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = require('electron')
const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev')
const {CompositeDisposable} = require('event-kit')

const {pref} = require('../configuration/config-file')
const ProfileManager = require('../configuration/profile-manager')
const {template} = require('./app-menu')

const visor = require('./visor')

const windows = []
const subscriptions = new CompositeDisposable()
const profileManager = new ProfileManager(pref)

if (!isDev) {
  require('update-electron-app')()
}

profileManager.validate()

const resetApplicationMenu = () =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template(createWindow, profileManager))
  )

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: ((process.platform === 'darwin') && 'hiddenInset') || 'hidden',
    frame: process.platform === 'darwin',
    vibrancy: profileManager.get('vibrancy')
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../renderer/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.focus()

  windows.push(win)
}

app.on('ready', () => {
  visor.register()
  createWindow()
  resetApplicationMenu()
  if (process.platform === 'darwin') {
    app.dock.setMenu(Menu.buildFromTemplate([
      {label: 'New Window', click: createWindow}
    ]))
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => subscriptions.dispose())

app.on('activate', () => {
  let windowCount = 0
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      windowCount += 1
    }
  })

  if (windowCount === 0) {
    createWindow()
  }
})

subscriptions.add(
  profileManager.onDidChange('vibrancy', value =>
    windows.forEach(win => {
      if (!win.isDestroyed()) {
        win.setVibrancy(value)
      }
    })
  )
)

subscriptions.add(profileManager.onDidChange('singleTabMode', resetApplicationMenu))
subscriptions.add(profileManager.onActiveProfileChange(resetApplicationMenu))

ipcMain.on('open-hamburger-menu', (ev, args) => Menu.getApplicationMenu().popup(args))
