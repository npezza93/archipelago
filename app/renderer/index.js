/* global document */
/* eslint guard-for-in: "off" */

const React = require('react')
const ReactDOM = require('react-dom')
const ipc = require('electron-better-ipc')

const App = require('./app')

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
  React.createElement(App), document.getElementById('root')
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
