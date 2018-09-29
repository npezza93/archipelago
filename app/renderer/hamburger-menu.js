const {Component, createElement} = require('react')
const {platform, app} = require('electron-util')

module.exports =
class HamburgerMenu extends Component {
  render() {
    return platform({
      macos: null,
      default: createElement(
        'hamburger-menu', {
          onClick(event) {
            const {right, bottom} = event.currentTarget.getBoundingClientRect()
            app.ipcRenderer.send('open-hamburger-menu', {x: right, y: bottom})
          }
        },
        createElement('div'),
        createElement('div'),
        createElement('div')
      )
    })
  }
}
