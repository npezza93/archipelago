'use strict'

const path = require('path')
const Split = require(path.join(__dirname, '/js/split'))

require(path.join(__dirname, '/js/quark_tab'))
require(path.join(__dirname, '/js/quark_terminal'))

let pressedKeys = []

window.addEventListener('resize', function() {
  for (var terminal of document.querySelectorAll('.tab-container:not(.hidden) quark-terminal')) {
    terminal.fit()
  }
})

document.documentElement.style.setProperty('--cursor-color', 'rgba(171, 178, 191, 0.8)')
document.documentElement.style.setProperty('--background-color', 'rgba(40, 44, 52, 0.1)')

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
  document.querySelector('#titlebar').appendChild(document.createElement('quark-tab'))
}
