import {Component, createElement} from 'react'
import {platform} from 'electron-util'
import ipc from 'electron-better-ipc'

export default class HamburgerMenu extends Component {
  render() {
    return platform({
      macos: null,
      default: createElement(
        'hamburger-menu', {
          onClick(event) {
            const {right, bottom} = event.currentTarget.getBoundingClientRect()
            ipc.callMain('open-hamburger-menu', {x: right, y: bottom})
          }
        },
        createElement('div'), createElement('div'), createElement('div')
      )
    })
  }
}
