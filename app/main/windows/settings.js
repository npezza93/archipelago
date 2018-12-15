import {darkMode} from 'electron-util'
import {makeWindow} from '../utils'

let settingsWindow = null
const windowOptions = {
  backgroundColor: darkMode.isEnabled ? '#393736' : '#F5F5F5',
  webPreferences: {experimentalFeatures: true}
}

export default {
  toggle() {
    if (settingsWindow === null || settingsWindow.isDestroyed()) {
      settingsWindow = makeWindow('settings', windowOptions)
    } else {
      settingsWindow.focus()
    }
  }
}
