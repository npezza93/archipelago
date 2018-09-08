const {ipcRenderer} = require('electron')
const {Component, createElement} = require('react')

module.exports =
class HamburgerMenu extends Component {
  render() {
    if (process.platform === 'darwin') {
      return null
    }

    return createElement(
      'hamburger-menu', {
        onClick(event) {
          const {right, bottom} = event.currentTarget.getBoundingClientRect()
          ipcRenderer.send('open-hamburger-menu', {x: right, y: bottom})
        }
      },
      createElement('div'),
      createElement('div'),
      createElement('div')
    )
  }
}
