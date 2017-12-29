{ ipcRenderer }     = require('electron')
React               = require('react')
ReactDOM            = require('react-dom')
ConfigFile          = require('../utils/config_file')
ArchipelagoApp      = require('./archipelago_app')

configFile = new ConfigFile()

document.addEventListener 'DOMContentLoaded', () ->
  setDocumentSettings()
  global.app = ReactDOM.render(
    React.createElement(ArchipelagoApp), document.getElementById('root')
  )
  document.querySelector('#boot').classList.add('calculating')

setDocumentSettings = ->
  element = document.documentElement

  element.style.setProperty(
    '--font-family', configFile.activeSettings().fontFamily
  )
  element.style.setProperty(
    '--background-color', configFile.activeSettings().windowBackground
  )
  element.style.setProperty('--tab-color', configFile.activeSettings().tabColor)
  element.style.setProperty(
    '--tab-border-color', configFile.activeSettings().tabBorderColor
  )
  element.style.setProperty('--font-size', configFile.activeSettings().fontSize)

configFile.on('change', setDocumentSettings)

ipcRenderer.on 'new-tab', () ->
  global.app.addTab()
ipcRenderer.on 'split-horizontal', () ->
  global.app.split('horizontal')
ipcRenderer.on 'split-vertical', () ->
  global.app.split('vertical')
