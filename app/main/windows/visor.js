import electron, {app, globalShortcut} from 'electron'
import {CompositeDisposable} from 'event-kit'
import {argbBackground, makeWindow} from '../utils'

const subscriptions = new CompositeDisposable()

let visorWindow = null
let isVisorShowing = false

const hideVisor = () => {
  const {height} = electron.screen.getPrimaryDisplay().workAreaSize

  isVisorShowing = false
  visorWindow.setPosition(0, -parseInt(height * 0.4, 10), true)
  visorWindow.hide()
}

const showVisor = () => {
  isVisorShowing = true
  visorWindow.show()
  visorWindow.focus()
  visorWindow.setPosition(0, 22, true)
}

const create = profileManager => {
  if (visorWindow === null || visorWindow.isDestroyed()) {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

    isVisorShowing = false
    visorWindow = makeWindow('visor', {
      width,
      enableLargerThanScreen: true,
      height: parseInt(height * 0.4, 10),
      frame: false,
      x: 0,
      y: -parseInt(height * 0.4, 10),
      backgroundColor: argbBackground(profileManager, 'visor.background'),
      vibrancy: profileManager.get('visor.vibrancy')
    })
    visorWindow.name = 'visor'
    visorWindow.hideVisor = hideVisor

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
  globalShortcut.register(profileManager.get('visor.keybinding') || 'F1', () => {
    create(profileManager)
    if (isVisorShowing) {
      hideVisor()
    } else {
      showVisor()
    }
  })
}

app.on('quit', () => subscriptions.dispose())
app.on('will-quit', () => globalShortcut.unregisterAll())

export default profileManager => {
  subscriptions.add(
    profileManager.onDidChange('visor.keybinding', () => {
      globalShortcut.unregisterAll()
      register(profileManager)
    })
  )

  register(profileManager)
}
