const {app, BrowserWindow, globalShortcut} = require('electron')
const electron = require('electron')
const {CompositeDisposable} = require('event-kit')
const {is} = require('electron-util')

/* eslint-disable import/no-unresolved */
const {pref} = require('common/config-file')
const ProfileManager = require('common/profile-manager')
/* eslint-enable import/no-unresolved */

const preferences = pref()
const profileManager = new ProfileManager(preferences)
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

const create = () => {
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

    visorWindow.loadFile('app/visor/index.html')

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

app.on('quit', () => {
  subscriptions.dispose()
  preferences.dispose()
})

app.on('will-quit', () => globalShortcut.unregisterAll())

module.exports = {
  register() {
    create()
    globalShortcut.register('F1', () => {
      create()
      if (isVisorShowing) {
        hideVisor()
      } else {
        showVisor()
      }
    })
  }
}
