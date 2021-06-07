/* global window, document, ResizeObserver */

import {ipcRenderer as ipc} from 'electron-better-ipc'
import debouncer from 'debounce-fn'
import React from 'react'
import {Disposable} from 'event-kit'
import Session from './session'
import Component from '../utils/component.jsx'
import CurrentProfile from '../utils/current-profile'
import 'xterm/css/xterm.css'
import './styles.css'

export default class App extends Component {
  render() {
    return <archipelago-terminal ref={this.setRef}></archipelago-terminal>
  }

  initialState() {
    return { session: new Session() }
  }

  initialize() {
    this.currentProfile = new CurrentProfile()
    this.resizeObserver = new ResizeObserver(this.fit)
    this.resetCssSettings()
  }

  cleanup() {
    this.state.session.kill()
  }

  componentWillUnmount() {
    this.cleanup()
    window.removeEventListener('beforeunload', this.cleanup)
  }

  componentDidUpdate() {
    return this.state.session.xterm.focus()
  }

  componentDidMount() {
    this.state.session.attach(this.container)

    this.resizeObserver.observe(this.container)
  }

  setRef(container) {
    this.container = container
  }

  fit() {
    debouncer(this.state.session.fit, {wait: 150})()
  }

  get styleProperties() {
    return {
      'theme.background': '--background-color',
      tabBorderColor: '--tab-border-color',
      padding: '--terminal-padding'
    }
  }

  resetCssSettings() {
    for (const property in this.styleProperties) {
      document.documentElement.style.setProperty(
        this.styleProperties[property],
        this.currentProfile.get(property)
      )
    }
  }

  handleSettingChanged({property, value}) {
    if (property in this.styleProperties) {
      document.documentElement.style.setProperty(this.styleProperties[property], value)
    }
  }

  async close() {
    await this.state.session.kill()

    window.close()
  }

  bindListeners() {
    ipc.on('close-via-menu', this.close)
    this.addSubscription(new Disposable(() => ipc.removeListener('close-via-menu', this.close)))
    this.addSubscription(new Disposable(ipc.answerMain('setting-changed', this.handleSettingChanged)))
    this.addSubscription(new Disposable(ipc.answerMain('active-profile-changed', this.resetCssSettings)))
    this.addSubscription(new Disposable(ipc.answerMain('close', this.close)))
    this.addSubscription(new Disposable(() => this.resizeObserver.unobserve(this.container)))
    this.addSubscription(this.state.session.onExit(this.close))
  }
}
