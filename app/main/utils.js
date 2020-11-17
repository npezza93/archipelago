import {BrowserWindow, app} from 'electron'
import {is, platform} from 'electron-util'
import Color from 'color'
import {ipcMain as ipc} from 'electron-better-ipc'
import darwinAccelerators from './accelerators/darwin.json'
import linuxAccelerators from './accelerators/linux.json'
import windowsAccelerators from './accelerators/windows.json'

export const argbBackground = (profileManager, property) => {
  const color = new Color(profileManager.get(property))
  const hex = color.hex().slice(1)
  let opacity = Math.round(color.alpha() * 255).toString(16)
  opacity = (opacity.length < 2) ? '0' + opacity : opacity

  return `#${opacity}${hex}`
}

export const makeWindow = (name, options) => {
  const newWindow = new BrowserWindow(Object.assign({
    width: 600,
    height: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    frame: is.macos,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webviewTag: true
    }
  }, options))

  loadUrl(newWindow, name)

  newWindow.once('close', event => {
    event.preventDefault()
    ipc.callRenderer(newWindow, 'close').then(() => {
      newWindow.hide()
      newWindow.destroy()
    })
  })

  app.on('before-quit', () => {
    if ((newWindow !== null) && !newWindow.isDestroyed()) {
      newWindow.removeAllListeners('close')
      newWindow.removeAllListeners('context-menu')
    }
  })

  newWindow.once('ready-to-show', newWindow.show)

  newWindow.webContents.once('did-finish-load', () => {
    if (newWindow.title) {
      newWindow.setTitle(newWindow.title)
    }
  })

  return newWindow
}

export const accelerators = platform({
  macos: darwinAccelerators,
  linux: linuxAccelerators,
  windows: windowsAccelerators
})

const loadUrl = (browserWindow, anchor) => {
  let url

  if (is.development && process.env.ELECTRON_WEBPACK_WDS_PORT) {
    url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#${anchor}`
  } else if (is.development && !process.env.ELECTRON_WEBPACK_WDS_PORT) {
    url = `file://${__dirname}/../renderer/index.html#${anchor}`
  } else {
    url = `file:///${__dirname}/index.html#${anchor}`
  }

  browserWindow.loadURL(url)
}
