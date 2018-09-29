const {app, BrowserWindow, Menu, ipcMain} = require('electron')
const {is, platform} = require('electron-util')
const {CompositeDisposable} = require('event-kit')

const {pref} = require('../configuration/config-file')
const ProfileManager = require('../configuration/profile-manager')
const {template} = require('./app-menu')

const windows = []
const subscriptions = new CompositeDisposable()
const profileManager = new ProfileManager(pref())

if (!is.development) {
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
    titleBarStyle: platform({macos: 'hiddenInset', default: 'hidden'}),
    frame: is.macos,
    vibrancy: profileManager.get('vibrancy')
  })

  win.loadFile('app/renderer/index.html')
  win.focus()
  windows.push(win)
}

app.on('ready', () => {
  createWindow()
  resetApplicationMenu()
  if (is.macos) {
    app.dock.setMenu(Menu.buildFromTemplate([
      {label: 'New Window', click: createWindow}
    ]))
  }
})

app.on('window-all-closed', () => {
  if (!is.macos) {
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
