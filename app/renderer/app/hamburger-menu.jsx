import React from 'react'
import {platform, is} from 'electron-util'
import {ipcRenderer as ipc} from 'electron-better-ipc'
import {Disposable} from 'event-kit'
import Component from '../utils/component.jsx'

export default class HamburgerMenu extends Component {
  render() {
    return platform({
      macos: null,
      default: <hamburger-menu onClick={this.handleClick}>
        <div style={{background: this.state.backgroundColor}}></div>
        <div style={{background: this.state.backgroundColor}}></div>
        <div style={{background: this.state.backgroundColor}}></div>
      </hamburger-menu>
    })
  }

  handleClick(event) {
    const {right, bottom} = event.currentTarget.getBoundingClientRect()
    ipc.callMain('open-hamburger-menu', {x: right, y: bottom})
  }

  get backgroundColor() {
    return this.props.currentProfile.get('tabColor')
  }

  initialState() {
    return platform({
      macos: {},
      default: {backgroundColor: this.backgroundColor}
    })
  }

  bindListeners() {
    if (!is.macos) {
      this.addSubscription(new Disposable(
        ipc.answerMain('setting-changed', ({property, value}) => {
          if (property === 'tabColor') {
            this.setState({backgroundColor: value})
          }
        })
      ))
      this.addSubscription(new Disposable(
        ipc.answerMain('active-profile-changed', () => {
          this.setState({backgroundColor: this.backgroundColor})
        })
      ))
    }
  }
}
