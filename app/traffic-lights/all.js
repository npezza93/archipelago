const {Component, createElement} = require('react')
const {platform} = require('electron-util')

const Minimize = require('./minimize')
const Maximize = require('./maximize')
const Close = require('./close')

module.exports =
class TrafficLights extends Component {
  render() {
    return platform({
      macos: null,
      default: createElement(
        'div',
        {},
        createElement(Minimize), createElement(Maximize), createElement(Close)
      )
    })
  }
}
