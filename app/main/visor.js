import electron, {app, BrowserWindow, globalShortcut} from 'electron'
import {CompositeDisposable} from 'event-kit'
import {is} from 'electron-util'

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
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

  if (visorWindow === null || visorWindow.isDestroyed()) {
    isVisorShowing = false
    visorWindow = new BrowserWindow({
      width,
      enableLargerThanScreen: true,
      height: parseInt(height * 0.4, 10),
      show: false,
      frame: false,
      x: 0,
      y: -parseInt(height * 0.4, 10),
      vibrancy: profileManager.get('visor.vibrancy')
    })

    if (is.development) {
      visorWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#visor`)
    } else {
      visorWindow.loadFile('dist/renderer/index.html#visor')
    }

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

app.on('quit', () => subscriptions.dispose())
app.on('will-quit', () => globalShortcut.unregisterAll())

export default profileManager => {
  create(profileManager)
  globalShortcut.register('F1', () => {
    create(profileManager)
    if (isVisorShowing) {
      hideVisor()
    } else {
      showVisor()
    }
  })
}
