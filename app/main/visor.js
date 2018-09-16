const {app, BrowserWindow, globalShortcut} = require('electron')
const electron = require('electron')
const path = require('path')
const url = require('url')
const {CompositeDisposable, Disposable} = require('event-kit')
const ConfigFile = require('../configuration/config-file')
const ProfileManager = require('../configuration/profile-manager')

const profileManager = new ProfileManager(new ConfigFile())
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

app.on('quit', () => subscriptions.dispose())

module.exports = {
  register() {
    globalShortcut.register('F1', () => {
      const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize

      if ((visorWindow === null) || visorWindow.isDestroyed()) {
        isVisorShowing = false
        visorWindow = new BrowserWindow({
          width,
          enableLargerThanScreen: true,
          height: parseInt(height * 0.4, 10),
          show: true,
          frame: false,
          x: 0,
          y: -parseInt(height * 0.4, 10),
          icon: path.join(__dirname, '../../../build/icon.png'),
          vibrancy: profileManager.get('visor.vibrancy')
        })

        visorWindow.loadURL(url.format({
          pathname: path.join(__dirname, '../visor/index.html'),
          protocol: 'file:',
          slashes: true
        }))
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

      if (isVisorShowing) {
        hideVisor()
      } else {
        showVisor()
      }
    })
  }
}
