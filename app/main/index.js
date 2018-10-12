import {app, BrowserWindow, Menu} from 'electron'
import {is, platform} from 'electron-util'
import {CompositeDisposable} from 'event-kit'
import {pref} from '../common/config-file'
import ProfileManager from '../common/profile-manager'
import template from './app-menu'
import registerVisor from './visor'
import listeners from './listeners'

const windows = []
const subscriptions = new CompositeDisposable()
global.profileManager = new ProfileManager(pref())

if (!is.development) {
  require('update-electron-app')()
}

listeners(profileManager)
profileManager.validate()

const resetApplicationMenu = () =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template(createWindow, profileManager))
  )

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false,
    titleBarStyle: platform({macos: 'hiddenInset', default: 'hidden'}),
    frame: is.macos,
    backgroundColor: profileManager.get('windowBackground'),
    vibrancy: profileManager.get('vibrancy')
  })

  if (is.development) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    win.loadURL(`file:///${__dirname}/index.html`)
  }

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })

  windows.push(win)
}

app.on('ready', () => {
  registerVisor(profileManager)
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
