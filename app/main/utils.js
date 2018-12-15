import {is} from 'electron-util'
import Color from 'color'

export const argbBackground = (profileManager, property) => {
  const color = new Color(profileManager.get(property))
  const hex = color.hex().substring(1)
  let opacity = Math.round(color.alpha() * 255).toString(16)
  opacity = (opacity.length < 2) ? '0' + opacity : opacity

  return `#${opacity}${hex}`
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
