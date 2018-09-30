const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const {is} = require('electron-util')

const ProfileManager = require('../../app/configuration/profile-manager')
const {pref} = require('../../app/configuration/config-file')

let settings = null
const preferences = pref()
const profileManager = new ProfileManager(preferences)

profileManager.validate()

app.on('ready', () => {
  settings = new BrowserWindow({
    width: 600,
    height: 600,
    show: true,
    titleBarStyle: 'hiddenInset',
    frame: is.macos,
    webPreferences: {
      experimentalFeatures: true
    }
  })

  settings.loadURL(url.format({
    pathname: path.join(__dirname, '../../app/settings/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  settings.on('closed', () => {
    settings = null
  })
})

app.on('quit', () => preferences.dipose())
