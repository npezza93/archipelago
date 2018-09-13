const {Component, createElement} = require('react')

const Minimize = require('./minimize')
const Maximize = require('./maximize')
const Close = require('./close')

module.exports =
class TrafficLights extends Component {
  render() {
    let lights

    if (process.platform === 'darwin') {
      lights = null
    } else {
      lights = createElement(
        'div', {},
        createElement(Minimize), createElement(Maximize), createElement(Close)
      )
    }

    return lights
  }
}
