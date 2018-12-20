/* global window */

import React from 'react'
import ipc from 'npezza93-electron-better-ipc'
import {Disposable} from 'event-kit'
import keystrokeForKeyboardEvent from 'keystroke-for-keyboard-event'
import formatAccelerator from './format-accelerator'
import Component from './component.jsx'
import './keybinding-capturer.css'

export default class KeybindingCapturer extends Component {
  render() {
    return <keybinding-capturer>
      <div>
        {formatAccelerator(this.state.value) || 'Type Hotkey'}
      </div>
      <svg>
        <circle ref={this.setProgress} cx="80" cy="80" r="78" strokeDasharray="1000" strokeDashoffset="1000"/>
      </svg>
    </keybinding-capturer>
  }

  componentDidMount() {
    ipc.send('disable-shortcuts')
  }

  initialState() {
    return {
      value: this.props.currentKeybinding
    }
  }

  setProgress(div) {
    this.progress = div
  }

  cleanup() {
    this.subscriptions.dispose()
    ipc.send('enable-shortcuts')
    this.props.deactivate()
  }

  handleKeyDown(event) {
    event.preventDefault()
    event.stopPropagation()
    this.setState({value: keystrokeForKeyboardEvent(event)})

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.progress.style.transitionDuration = '0s'
      this.progress.style.strokeDashoffset = '1000'
      setTimeout(this.triggerProgress, 50)
    }
    this.timeout = setTimeout(() => {
      this.props.captureKeybinding(this.state.value)
      this.cleanup()
    }, 1650)
  }

  triggerProgress() {
    this.progress.style.transitionDuration = '3000ms'
    this.progress.style.strokeDashoffset = '0'
  }

  bindListeners() {
    window.addEventListener('keydown', this.handleKeyDown, true)
    window.addEventListener('keyup', this.triggerProgress, true)
    this.addSubscription(new Disposable(() => {
      window.removeEventListener('keydown', this.handleKeyDown, true)
    }))
    this.addSubscription(new Disposable(() => {
      window.removeEventListener('keyup', this.triggerProgress, true)
    }))
  }
}
