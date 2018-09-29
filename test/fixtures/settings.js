const {app} = require('electron')
const {BrowserWindow} = require('electron')

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
    frame: process.platform === 'darwin',
    webPreferences: {
      experimentalFeatures: true
    }
  })

  settings.loadFile('app/settings/index.html')

  settings.on('closed', () => {
    settings = null
  })
})

app.on('quit', () => preferences.dipose())
