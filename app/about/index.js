/* global document */

const {remote} = require('electron')

if (process.platform !== 'darwin') {
  const React = require('react')
  const ReactDOM = require('react-dom')
  const TrafficLights = require('../traffic-lights/all')

  ReactDOM.render(
    React.createElement(TrafficLights),
    document.querySelector('#traffic-lights')
  )
}

document.querySelector('#version').innerText = `v${remote.app.getVersion()}`
