import {BrowserWindow, systemPreferences} from 'electron'
import {is} from 'electron-util'
import ipc from 'electron-better-ipc'

let searchWindow = null

export default {
  display(currentPosition) {
    if (searchWindow === null || searchWindow.isDestroyed()) {
      searchWindow = new BrowserWindow({
        width: 300,
        height: 250,
        show: false,
        x: currentPosition[0] - 300,
        y: currentPosition[1],
        titleBarStyle: 'hiddenInset',
        backgroundColor: systemPreferences.isDarkMode() ? '#393736' : '#F5F5F5',
        frame: is.macos
      })

      if (is.development) {
        searchWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#search`)
      } else {
        searchWindow.loadURL(`file:///${__dirname}/index.html#search`)
      }

      searchWindow.once('ready-to-show', () => searchWindow.show())
    } else {
      searchWindow.focus()
    }
  },
  hide() {
    this.callOnWindow(() => searchWindow.close())
  },
  next() {
    this.callOnWindow(() => ipc.callRenderer(searchWindow, 'search-next'))
  },
  previous() {
    this.callOnWindow(() => ipc.callRenderer(searchWindow, 'search-previous'))
  },
  callOnWindow(caller) {
    if (searchWindow !== null && !searchWindow.isDestroyed()) {
      caller()
    }
  }
}
