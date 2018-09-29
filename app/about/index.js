/* global document, window */

const {is, api} = require('electron-util')
const ipc = require('electron-better-ipc')

if (!is.macos) {
  const {createElement} = require('react')
  const {render} = require('react-dom')
  const TrafficLights = require('../traffic-lights/all')

  render(
    createElement(TrafficLights), document.querySelector('#traffic-lights')
  )
}

document.querySelector('#version').innerText = `v${api.app.getVersion()}`

ipc.answerMain('close-current-tab', () => window.close())
