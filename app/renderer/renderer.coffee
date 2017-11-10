{ ipcRenderer } = require('electron')
Split           = require('./split')
ConfigFile      = require('../utils/config_file')

require('./archipelago_tab')
require('./archipelago_terminal')

configFile = new ConfigFile()

window.addEventListener 'resize', () =>
  selector = '.tab-container:not(.hidden) archipelago-terminal'
  document.querySelectorAll(selector).forEach (terminal) =>
    terminal.fit()

window.addEventListener 'beforeunload', () =>
  document.querySelectorAll('archipelago-terminal').forEach (terminal) =>
    terminal.windowClosing = true
    terminal.xterm.destroy()
    terminal.pty.kill()

document.addEventListener 'DOMContentLoaded', () =>
  setDocumentSettings()

  newTab()

newTab = ->
  tab = document.createElement('archipelago-tab')
  document.querySelector('#titlebar').appendChild(tab)

setDocumentSettings = ->
  element = document.documentElement

  element.style.setProperty('--font-family', configFile.activeSettings().fontFamily)
  element.style.setProperty('--font-size', configFile.activeSettings().fontSize)
  element.style.setProperty('--background-color', configFile.activeSettings().windowBackground)
  element.style.setProperty('--tab-color', configFile.activeSettings().tabColor)

configFile.on('change', setDocumentSettings)

ipcRenderer.on 'new-tab', newTab
ipcRenderer.on 'split-horizontal', () =>
  (new Split('horizontal')).split()
ipcRenderer.on 'split-vertical', () =>
  (new Split('vertical')).split()
