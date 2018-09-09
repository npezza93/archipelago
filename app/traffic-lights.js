const React = require('react')

const Minimize = require('./traffic-lights/minimize')
const Maximize = require('./traffic-lights/maximize')
const Close = require('./traffic-lights/close')

module.exports =
class TrafficLights extends React.Component {
  render() {
    if (process.platform === 'darwin') {
      return null
    }

    return React.createElement(
      'div',
      {},
      React.createElement(Minimize),
      React.createElement(Maximize),
      React.createElement(Close)
    )
  }
}
