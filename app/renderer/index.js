/* global document */
/* eslint guard-for-in: "off" */

import css from '@/renderer.css'
import xtermCss from 'xterm/dist/xterm.css'

import {createElement} from 'react'
import ReactDOM from 'react-dom'
import ipc from 'electron-better-ipc'
import App from '@/app'

global.archipelago = {}
const styles = document.documentElement.style
const styleProperties = {
  fontFamily: '--font-family',
  windowBackground: '--background-color',
  tabColor: '--tab-color',
  tabBorderColor: '--tab-border-color',
  fontSize: '--font-size',
  padding: '--terminal-padding',
  'theme.selection': '--selection-color'
}

global.archipelago.app = ReactDOM.render(
  createElement(App), document.getElementById('app')
)

const preferences = ipc.sendSync('get-preferences-sync', Object.keys(styleProperties))
Object.keys(preferences).forEach(preference => {
  styles.setProperty(styleProperties[preference], preferences[preference])
})

ipc.answerMain('preference-change', (preference, newValue) => {
  if (styleProperties[preference]) {
    styles.setProperty(styleProperties[preference], newValue)
  }
})
