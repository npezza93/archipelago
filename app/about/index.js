/* global document, window */

const {remote, ipcRenderer: ipc} = require('electron')
const {is} = require('electron-util')

if (!is.macos) {
  const {createElement} = require('react')
  const {render} = require('react-dom')
  const TrafficLights = require('../traffic-lights/all')

  render(
    createElement(TrafficLights), document.querySelector('#traffic-lights')
  )
}

document.querySelector('#version').innerText = `v${remote.app.getVersion()}`

ipc.on('close-current-tab', () => window.close())
