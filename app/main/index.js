/* global profileManager */

import {app, BrowserWindow, Menu} from 'electron'
import {is, platform} from 'electron-util'
import {CompositeDisposable} from 'event-kit'
import ipc from 'electron-better-ipc'
import Color from 'color'
import {pref} from '../common/config-file'
import ProfileManager from './profile-manager'
import template from './app-menu'
import registerVisor from './visor'
import ptyManager from './pty-manager'

if (!is.development) {
  require('update-electron-app')()
}

let currentTerminalWindow = null
const windows = []
const subscriptions = new CompositeDisposable()
global.profileManager = new ProfileManager(pref())
profileManager.validate()
ptyManager()

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
    backgroundColor: (new Color(profileManager.get('windowBackground'))).hex(),
    vibrancy: profileManager.get('vibrancy')
  })

  if (is.development && process.env.ELECTRON_WEBPACK_WDS_PORT) {
    win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else if (process.env.NODE_ENV === 'test') {
    win.loadURL(`file://${__dirname}/../renderer/index.html`)
  } else {
    win.loadURL(`file:///${__dirname}/index.html`)
  }

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })
  win.on('focus', () => {
    currentTerminalWindow = win
  })
  win.once('close', e => {
    e.preventDefault()
    ipc.callRenderer(win, 'close').then(() => {
      win.hide()
      win.close()
    })
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

app.on('before-quit', () => {
  windows.forEach(win => {
    win.removeAllListeners('close')
  })
})

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
ipc.answerRenderer('search-next', ({query, options}) => {
  ipc.callRenderer(currentTerminalWindow, 'search-next', {query, options})
})
ipc.answerRenderer('search-previous', ({query, options}) => {
  ipc.callRenderer(currentTerminalWindow, 'search-previous', {query, options})
})
