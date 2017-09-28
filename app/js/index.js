'use strict'

const { join } = require('path')
const Split = require(join(__dirname, '/js/split'))

require(join(__dirname, '/js/archipelago_tab'))
require(join(__dirname, '/js/archipelago_terminal'))

let pressedKeys = []

window.addEventListener('resize', function() {
  for (var terminal of document.querySelectorAll('.tab-container:not(.hidden) archipelago-terminal')) {
    terminal.fit()
  }
})

// theme 1
document.documentElement.style.setProperty('--cursor-color', 'rgba(171, 178, 191, 0.8)')
document.documentElement.style.setProperty('--background-color', 'rgba(40, 44, 52, 0.1)')
// theme 2
// document.documentElement.style.setProperty('--cursor-color', '#fff')
// document.documentElement.style.setProperty('--background-color', '#EEEEEE')

newTab()

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
