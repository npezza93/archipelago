import {app, Menu} from 'electron'
import {is} from 'electron-util'
import {CompositeDisposable, Disposable} from 'event-kit'
import ipc from 'electron-better-ipc'
import contextMenu from 'electron-context-menu'
import {pref} from './config-file'
import ProfileManager from './profile-manager'
import template from './app-menu'
import registerVisor from './windows/visor'
import ptyManager from './pty-manager'
import {argbBackground, makeWindow} from './utils'

if (!is.development) {
  require('update-electron-app')()
}

let currentTerminalWindow = null
const windows = []
const subscriptions = new CompositeDisposable()
const profileManager = new ProfileManager(pref())
profileManager.validate()
subscriptions.add(new Disposable(() => profileManager.dispose()))
ptyManager(profileManager)

const resetApplicationMenu = () =>
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(template(createWindow, profileManager))
  )

const createWindow = () => {
  const win = makeWindow(process.env.PAGE, {
    width: 1000,
    backgroundColor: argbBackground(profileManager, 'theme.background'),
    vibrancy: profileManager.get('vibrancy')
  })
  contextMenu({
    window: win,
    shouldShowMenu: (event, params) => params.isEditable
  })

  win.on('focus', () => {
    currentTerminalWindow = win
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
  const activeWindow = windows.find(win => !win.isDestroyed())

  if (!activeWindow) {
    createWindow()
  }
})

subscriptions.add(profileManager.onDidChange('vibrancy', value =>
  windows.forEach(win => {
    if (!win.isDestroyed()) {
      win.setVibrancy(value)
    }
  })
))

subscriptions.add(profileManager.onDidChange('singleTabMode', resetApplicationMenu))
subscriptions.add(profileManager.onDidChange('name', resetApplicationMenu))
subscriptions.add(profileManager.onActiveProfileChange(resetApplicationMenu))
subscriptions.add(new Disposable(
  ipc.answerRenderer('open-hamburger-menu', args => Menu.getApplicationMenu().popup(args))
))
subscriptions.add(new Disposable(
  ipc.answerRenderer('search-next', ({query, options}) => {
    ipc.callRenderer(currentTerminalWindow, 'search-next', {query, options})
  })
))
subscriptions.add(new Disposable(
  ipc.answerRenderer('search-previous', ({query, options}) => {
    ipc.callRenderer(currentTerminalWindow, 'search-previous', {query, options})
  })
))
