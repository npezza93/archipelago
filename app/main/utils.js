import {BrowserWindow, app} from 'electron'
import {is} from 'electron-util'
import Color from 'color'
import ipc from 'electron-better-ipc'

export const argbBackground = (profileManager, property) => {
  const color = new Color(profileManager.get(property))
  const hex = color.hex().substring(1)
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
    frame: is.macos
  }, options))

  loadUrl(newWindow, name)

  newWindow.once('close', e => {
    e.preventDefault()
    ipc.callRenderer(newWindow, 'close').then(() => {
      newWindow.hide()
      newWindow.destroy()
    })
  })

  app.on('before-quit', () => {
    if ((newWindow !== null) && !newWindow.isDestroyed()) {
      newWindow.removeAllListeners('close')
    }
  })

  newWindow.once('ready-to-show', newWindow.show)

  return newWindow
}

export const loadUrl = (browserWindow, anchor) => {
  let url

  if (is.development && process.env.ELECTRON_WEBPACK_WDS_PORT) {
    url = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}#${anchor}`
  } else if (process.env.NODE_ENV === 'test') {
    url = `file://${__dirname}/../renderer/index.html#${anchor}`
  } else {
    url = `file:///${__dirname}/index.html#${anchor}`
  }

  browserWindow.loadURL(url)
}
