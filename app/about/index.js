/* global document */

const {remote} = require('electron')

if (process.platform !== 'darwin') {
  const {createElement} = require('react')
  const {render} = require('react-dom')
  const TrafficLights = require('../traffic-lights/all')

  render(
    createElement(TrafficLights), document.querySelector('#traffic-lights')
  )
}

document.querySelector('#version').innerText = `v${remote.app.getVersion()}`
