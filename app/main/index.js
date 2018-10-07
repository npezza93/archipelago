import {app, BrowserWindow, Menu} from 'electron'
import {is, platform} from 'electron-util'
import {CompositeDisposable} from 'event-kit'

/* eslint-disable import/no-unresolved */
import {pref} from 'common/config-file'
import ProfileManager from 'common/profile-manager'
import template from '@/app-menu'
import registerVisor from '@/visor'
/* eslint-enable import/no-unresolved */

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

  if (is.development) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    win.loadFile('dist/renderer/index.html')
  }

  win.focus()
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

ipc.answerRenderer('open-hamburger-menu', args => Menu.getApplicationMenu().popup(args))

const getPreferences = preferences => {
  switch (preferences.constructor.name) {
    case 'String':
      return profileManager.get(preferences)
    case 'Array':
      return preferences.reduce((foundPreferences, setting) => {
        foundPreferences[setting] = profileManager.get(setting)

        return foundPreferences
      }, {})
    default:
      return null
  }
}

ipc.on('get-preferences-sync', (event, preferences) => {
  event.returnValue = getPreferences(preferences)
})

ipc.answerRenderer('get-preferences-async', preferences => {
  return getPreferences(preferences)
})
