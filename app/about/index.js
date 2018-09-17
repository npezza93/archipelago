/* global document, window */

const {remote, ipcRenderer} = require('electron')

if (process.platform !== 'darwin') {
  const {createElement} = require('react')
  const {render} = require('react-dom')
  const TrafficLights = require('../traffic-lights/all')

  render(
    createElement(TrafficLights), document.querySelector('#traffic-lights')
  )
}

document.querySelector('#version').innerText = `v${remote.app.getVersion()}`

ipcRenderer.on('close-current-tab', () => {
  window.close()
})
