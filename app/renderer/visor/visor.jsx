/* global document, window */

import ipc from 'electron-better-ipc'
import React from 'react'
import Component from '../utils/component.jsx'
import CurrentProfile from '../utils/current-profile'
import Tab from '../sessions/tab'
import Pane from './pane.jsx'
import 'xterm/lib/xterm.css'
import './styles.css'

export default class Visor extends Component {
  render() {
    return <archipelago-visor class={this.htmlClasses()}>
      <Pane
        id={this.state.tab.id}
        sessionTree={this.state.tab.root}
        removeSession={this.removeSession}
        selectSession={this.selectSession} />
    </archipelago-visor>
  }

  initialState() {
    return {tab: new Tab('visor')}
  }

  initialize() {
    this.currentProfile = new CurrentProfile()
    this.resetCssSettings()
  }

  htmlClasses() {
    return `${process.platform} single-tab-mode`
  }

  cleanup() {
    super.cleanup()
    this.state.tab.kill()
  }

  selectSession(id) {
    return this.setState({currentSessionId: id})
  }

  removeSession(sessionId) {
    const {tab} = this.state

    tab.remove(sessionId)
    if (tab.root === null) {
      this.state.tab.kill().then(window.close)
    } else {
      this.setState({tab})
    }
  }

  split(orientation) {
    const {tab} = this.state

    const newGroup = tab.add(this.state.currentSessionId, orientation)
    const currentSessionId = newGroup.right.id

    this.setState({tab, currentSessionId})
  }

  get docStyles() {
    return document.documentElement.style
  }

  get styleProperties() {
    return {
      'visor.background': '--background-color',
      'visor.padding': '--terminal-padding'
    }
  }

  resetCssSettings() {
    for (const property in this.styleProperties) {
      this.docStyles.setProperty(
        this.styleProperties[property],
        this.currentProfile.get(property)
      )
    }
  }

  handleSettingChanged({property, value}) {
    if (property in this.styleProperties) {
      this.docStyles.setProperty(this.styleProperties[property], value)
    }
  }

  bindListeners() {
    ipc.answerMain('split', this.split)
    ipc.answerMain('close', this.state.tab.kill)
    ipc.answerMain('setting-changed', this.handleSettingChanged)
    ipc.answerMain('active-profile-changed', this.resetCssSettings)
  }
}
