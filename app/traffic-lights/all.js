const React = require('react')

const Minimize = require('./minimize')
const Maximize = require('./maximize')
const Close = require('./close')

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
