React = require 'react'

Minimize = require '../traffic_lights/minimize'
Maximize = require '../traffic_lights/maximize'
Close    = require '../traffic_lights/close'

module.exports =
class TrafficLights extends React.Component
  render: ->
    React.createElement(
      'div'
      {}
      React.createElement(Minimize)
      React.createElement(Maximize)
      React.createElement(Close)
    )
