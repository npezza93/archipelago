import {BrowserWindow} from 'electron'
import {is, darkMode} from 'electron-util'
import {loadUrl} from './utils'

let aboutWindow = null

export default {
  toggle() {
    if (aboutWindow === null || aboutWindow.isDestroyed()) {
      aboutWindow = new BrowserWindow({
        width: 300,
        height: 500,
        show: false,
        titleBarStyle: 'hiddenInset',
        backgroundColor: darkMode.isEnabled ? '#393736' : '#F5F5F5',
        frame: is.macos
      })

      loadUrl(aboutWindow, 'about')

      aboutWindow.once('ready-to-show', aboutWindow.show)
    } else {
      aboutWindow.focus()
    }
  }
}
