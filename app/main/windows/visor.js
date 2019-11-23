import {app, globalShortcut, screen, Notification} from 'electron'
import contextMenu from 'electron-context-menu'
import {ipcMain as ipc} from 'electron-better-ipc'
import {Disposable, CompositeDisposable} from 'event-kit'
import {argbBackground, makeWindow} from '../utils'

const subscriptions = new CompositeDisposable()

let visorWindow = null
let isVisorShowing = false

const hideVisor = () => {
  const {height} = screen.getPrimaryDisplay().workAreaSize

  isVisorShowing = false
  visorWindow.setPosition(0, -parseInt(height * 0.4, 10), true)
  visorWindow.hide()
}

const showVisor = () => {
  const menuBarOffset = screen.getPrimaryDisplay().bounds.height - screen.getPrimaryDisplay().workArea.height

  isVisorShowing = true
  visorWindow.show()
  visorWindow.focus()
  visorWindow.setPosition(0, menuBarOffset, true)
}

const create = profileManager => {
  if (visorWindow === null || visorWindow.isDestroyed()) {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize

    isVisorShowing = false
    visorWindow = makeWindow('visor', {
      width,
      enableLargerThanScreen: true,
      height: parseInt(height * 0.4, 10),
      frame: false,
      titleBarStyle: 'customButtonsOnHover',
      x: 0,
      y: -parseInt(height * 0.4, 10),
      backgroundColor: argbBackground(profileManager, 'visor.background'),
      vibrancy: profileManager.get('visor.vibrancy')
    })
    visorWindow.name = 'visor'
    visorWindow.hideVisor = hideVisor
    contextMenu({window: visorWindow})

    visorWindow.on('blur', hideVisor)
    visorWindow.on('closed', () => subscriptions.dispose())
    subscriptions.add(
      profileManager.onDidChange('visor.vibrancy', value => {
        if (!visorWindow.isDestroyed()) {
          visorWindow.setVibrancy(value)
        }
      })
    )
  }
}

const register = profileManager => {
  const visorAccelerator = profileManager.get('visor.keybinding') || 'F1'
  try {
    globalShortcut.register(visorAccelerator.split('-').join('+'), () => {
      create(profileManager)
      if (isVisorShowing) {
        hideVisor()
      } else {
        showVisor()
      }
    })
  } catch (e) {
    (new Notification({
      title: 'Invalid visor keybinding',
      body: 'Please change to a valid keybinding which does not just include modifiers'
    })).show()
  }
}

app.on('quit', () => subscriptions.dispose())
app.on('will-quit', () => globalShortcut.unregisterAll())

export default profileManager => {
  const enableShortcuts = () => register(profileManager)
  const disableShortcuts = () => globalShortcut.unregisterAll()

  subscriptions.add(
    profileManager.onDidChange('visor.keybinding', () => {
      disableShortcuts()
      enableShortcuts()
    })
  )

  ipc.on('disable-shortcuts', disableShortcuts)
  subscriptions.add(
    new Disposable(() => ipc.removeListener('disable-shortcuts', disableShortcuts))
  )
  ipc.on('enable-shortcuts', enableShortcuts)
  subscriptions.add(
    new Disposable(() => ipc.removeListener('enable-shortcuts', enableShortcuts))
  )

  enableShortcuts()
}
