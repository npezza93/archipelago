import React from 'react'
import {platform, activeWindow} from 'electron-util'

class Minimize extends React.Component {
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
      <div style={{height: '2px', background: '#000'}}></div>
    </minimize-button>
  }
}

class Maximize extends React.Component {
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
      border: '#000 2px solid',
      filter: 'invert(20%)',
      cursor: 'pointer'}} onClick={() => activeWindow().maximize()} />
  }
}

class Close extends React.Component {
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
        background: '#000',
        transform: 'rotate(45deg)'}}></div>
      <div style={{
        height: '2px',
        position: 'absolute',
        width: '20px',
        top: '7px',
        left: '-2px',
        background: '#000',
        transform: 'rotate(135deg)'}}></div>
    </close-button>
  }
}

export default class TrafficLights extends React.Component {
  render() {
    return platform({
      macos: null,
      default: <div><Minimize /><Maximize /><Close /></div>
    })
  }
}
