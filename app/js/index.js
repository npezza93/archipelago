'use strict'

const { join } = require('path')
const Split = require(join(__dirname, '/js/split'))
const ConfigFile = require(join(__dirname, '/js/config_file'))

require(join(__dirname, '/js/archipelago_tab'))
require(join(__dirname, '/js/archipelago_terminal'))

let pressedKeys = []
let configFile  = new ConfigFile()

window.addEventListener('resize', function() {
  for (var terminal of document.querySelectorAll('.tab-container:not(.hidden) archipelago-terminal')) {
    terminal.fit()
  }
})

document.addEventListener('DOMContentLoaded', () => {
  setDocumentSettings()

  newTab()
})

document.addEventListener('keydown', (keyboardEvent) => {
  pressedKeys.push(keyboardEvent.keyCode)
  if (shortcutTriggered([91, 84])) newTab()
  if (shortcutTriggered([91, 83])) (new Split('horizontal')).split()
  if (shortcutTriggered([91, 16, 83]) || shortcutTriggered([16, 91, 83])) (new Split('vertical')).split()
})

document.addEventListener('keyup', () => {
  pressedKeys = []
})

function shortcutTriggered(shortcut) {
  return pressedKeys.join(',') === shortcut.join(',')
}

function newTab() {
  document.querySelector('#titlebar').appendChild(document.createElement('archipelago-tab'))
}

function setDocumentSettings() {
  let element = document.documentElement

  element.style.setProperty('--font-family', configFile.activeSettings.fontFamily)
  element.style.setProperty('--font-size', configFile.activeSettings.fontSize)
  element.style.setProperty('--background-color', configFile.activeSettings.windowBackground)
}

configFile.on('change', () => {
  setDocumentSettings()
})
