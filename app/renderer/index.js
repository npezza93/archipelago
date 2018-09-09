/* global document */
/* eslint guard-for-in: "off" */

global.archipelago = require('../configuration/global')

const {ipcRenderer} = require('electron')

const styleProperties = {
  fontFamily: '--font-family',
  windowBackground: '--background-color',
  tabColor: '--tab-color',
  tabBorderColor: '--tab-border-color',
  fontSize: '--font-size',
  padding: '--terminal-padding',
  'theme.selection': '--selection-color'
}

document.addEventListener('DOMContentLoaded', () => {
  const React = require('react')
  const ReactDOM = require('react-dom')
  const App = require('./app')

  archipelago.app = ReactDOM.render(
    React.createElement(App), document.getElementById('root')
  )

  for (const selector in styleProperties) {
    const cssVar = styleProperties[selector]
    const element = document.documentElement

    element.style.setProperty(cssVar, archipelago.config.get(selector))
  }
})

ipcRenderer.on('new-tab', () => {
  if (!archipelago.config.get('singleTabMode')) {
    return archipelago.app.addTab()
  }
})
ipcRenderer.on('split-horizontal', () => archipelago.app.split('horizontal'))
ipcRenderer.on('split-vertical', () => archipelago.app.split('vertical'))

Object.entries(styleProperties).forEach(property =>
  archipelago.config.onDidChange(property[0], newValue => document.documentElement.style.setProperty(property[1], newValue))
)
