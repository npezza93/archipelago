const {app} = require('electron')
const {BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

const {pref} = require('../../app/configuration/config-file')
const ProfileManager = require('../../app/configuration/profile-manager')

let settings = null
const profileManager = new ProfileManager(pref)

profileManager.validate()

app.on('ready', () => {
  settings = new BrowserWindow({
    width: 1100,
    height: 600,
    show: true,
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin',
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
