{ ipcRenderer }     = require('electron')
React               = require('react')
ReactDOM            = require('react-dom')
ArchipelagoApp      = require('./archipelago_app')

styleProperties =
  fontFamily: '--font-family'
  windowBackground: '--background-color'
  tabColor: '--tab-color'
  tabBorderColor: '--tab-border-color'
  fontSize: '--font-size'

document.addEventListener 'DOMContentLoaded', () ->
  global.app = ReactDOM.render(
    React.createElement(ArchipelagoApp), document.getElementById('root')
  )
  document.querySelector('#boot').classList.add('calculating')

  for selector, cssVar of styleProperties
    element = document.documentElement

    element.style.setProperty(cssVar, archipelago.config.get(selector))

    archipelago.config.onDidChange selector, (newValue) =>
      element.style.setProperty(cssVar, newValue)

ipcRenderer.on 'new-tab', () ->
  global.app.addTab()
ipcRenderer.on 'split-horizontal', () ->
  global.app.split('horizontal')
ipcRenderer.on 'split-vertical', () ->
  global.app.split('vertical')
