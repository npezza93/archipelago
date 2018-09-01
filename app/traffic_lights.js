const React = require('react')

const Minimize = require('./traffic_lights/minimize')
const Maximize = require('./traffic_lights/maximize')
const Close    = require('./traffic_lights/close')

module.exports =
class TrafficLights extends React.Component {
  render() {
    return React.createElement(
      'div',
      {},
      React.createElement(Minimize),
      React.createElement(Maximize),
      React.createElement(Close)
    )
  }
}
