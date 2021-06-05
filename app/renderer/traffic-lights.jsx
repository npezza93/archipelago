import {ipcRenderer as ipc} from 'electron-better-ipc'
import React from 'react'
import {Disposable} from 'event-kit'
import {platform, activeWindow, darkMode} from 'electron-util'
import Component from './utils/component.jsx'

class TrafficLight extends Component {
  get backgroundColor() {
    let color
    if (this.props.currentProfile) {
      color = this.props.currentProfile.get('tabColor')
    } else if (darkMode.isEnabled) {
      color = '#F5F5F5'
    } else {
      color = '#424242'
    }

    return color
  }

  initialState() {
    return {backgroundColor: this.backgroundColor}
  }

  bindListeners() {
    if (this.props.currentProfile) {
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

class Minimize extends TrafficLight {
  render() {
    return <minimize-button style={{
      WebkitAppRegion: 'no-drag',
      flexDirection: 'column',
      justifyContent: 'center',
      display: 'flex',
      height: '16px',
      width: '16px',
      right: '113px',
      top: '14px',
      position: 'fixed',
      zIndex: 4,
      filter: 'invert(20%)',
      cursor: 'pointer'
    }} onClick={() => activeWindow().minimize()}>
      <div style={{height: '2px', background: this.state.backgroundColor}}></div>
    </minimize-button>
  }
}

class Maximize extends TrafficLight {
  render() {
    return <maximize-button style={{
      WebkitAppRegion: 'no-drag',
      flexDirection: 'column',
      justifyContent: 'center',
      display: 'flex',
      height: '12px',
      width: '12px',
      right: '61px',
      top: '14px',
      position: 'fixed',
      zIndex: 4,
      border: `${this.state.backgroundColor} 2px solid`,
      filter: 'invert(20%)',
      cursor: 'pointer'}} onClick={() => activeWindow().maximize()} />
  }
}

class Close extends TrafficLight {
  render() {
    return <close-button style={{
      WebkitAppRegion: 'no-drag',
      height: '16px',
      width: '16px',
      right: '13px',
      top: '14px',
      position: 'fixed',
      zIndex: 4,
      filter: 'invert(20%)',
      cursor: 'pointer'
    }} onClick={() => activeWindow().close()}>
      <div style={{
        height: '2px',
        position: 'absolute',
        width: '20px',
        top: '7px',
        left: '-2px',
        background: this.state.backgroundColor,
        transform: 'rotate(45deg)'}}></div>
      <div style={{
        height: '2px',
        position: 'absolute',
        width: '20px',
        top: '7px',
        left: '-2px',
        background: this.state.backgroundColor,
        transform: 'rotate(135deg)'}}></div>
    </close-button>
  }
}

export default class TrafficLights extends React.Component {
  render() {
    return platform({
      macos: null,
      default: (
        <div>
          <Minimize currentProfile={this.props.currentProfile} />
          <Maximize currentProfile={this.props.currentProfile} />
        </div>
      )
    })
  }
}
