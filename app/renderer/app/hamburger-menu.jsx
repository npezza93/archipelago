import React from 'react'
import {platform} from 'electron-util'
import ipc from 'electron-better-ipc'
import Component from '../utils/component.jsx'

export default class HamburgerMenu extends Component {
  render() {
    return platform({
      macos: null,
      default: <hamburger-menu onClick={this.handleClick}>
        <div></div>
        <div></div>
        <div></div>
      </hamburger-menu>
    })
  }

  handleClick(event) {
    const {right, bottom} = event.currentTarget.getBoundingClientRect()
    ipc.callMain('open-hamburger-menu', {x: right, y: bottom})
  }
}
