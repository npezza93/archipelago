React      = require 'react'
ReactDOM   = require 'react-dom'
{ remote } = require 'electron'

TrafficLights = require '../traffic_lights'

document.addEventListener 'DOMContentLoaded', () ->
  document.querySelector('#version').innerText = "v#{remote.app.getVersion()}"

  ReactDOM.render(
    React.createElement(TrafficLights),
    document.querySelector('#traffic-lights')
  )
