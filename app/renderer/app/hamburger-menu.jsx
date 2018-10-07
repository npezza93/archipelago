import React from 'react'
import {platform} from 'electron-util'
import ipc from 'electron-better-ipc'

export default class HamburgerMenu extends React.Component {
  render() {
    return platform({
      macos: null,
      default: <hamburger-menu onClick={this.handleClick.bind(this)}>
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
