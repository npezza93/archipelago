/* global document */

import React from 'react'
import ReactDOM from 'react-dom'
import ipc from 'electron-better-ipc'

/* eslint-disable import/no-unresolved */
import App from '@/app/app'
import 'xterm/dist/xterm.css' // eslint-disable-line import/no-unassigned-import
import '@/app/styles' // eslint-disable-line import/no-unassigned-import
/* eslint-enable import/no-unresolved */

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
  <App />, document.getElementById('app')
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
