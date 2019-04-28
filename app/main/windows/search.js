import {ipcMain as ipc} from 'electron-better-ipc'
import {darkMode} from 'electron-util'
import {makeWindow} from '../utils'

let searchWindow = null

export default {
  toggle(currentPosition) {
    if (searchWindow === null || searchWindow.isDestroyed()) {
      searchWindow = makeWindow('search', {
        width: 300,
        height: 280,
        x: currentPosition[0] - 300,
        y: currentPosition[1],
        backgroundColor: darkMode.isEnabled ? '#393736' : '#F5F5F5'
      })
      searchWindow.title = 'Search'
    } else {
      searchWindow.focus()
    }
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
