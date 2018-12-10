/* global document, window */

import ipc from 'electron-better-ipc'
import React from 'react'
import Component from '../utils/component.jsx'
import Tab from '../sessions/tab'
import Pane from './pane.jsx'
import 'xterm/lib/xterm.css' // eslint-disable-line import/no-unassigned-import
import './styles.css' // eslint-disable-line import/no-unassigned-import

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
      fontFamily: '--font-family',
      'visor.background': '--background-color',
      fontSize: '--font-size',
      'visor.padding': '--terminal-padding',
      'theme.selection': '--selection-color'
    }
  }

  resetCssSettings() {
    ipc.callMain('visor-css-settings').then(settings => {
      for (const property in this.styleProperties) {
        this.docStyles.setProperty(this.styleProperties[property], settings[property])
      }
    })
  }

  handleSettingChanged({property, value}) {
    if (property in this.styleProperties) {
      this.docStyles.setProperty(this.styleProperties[property], value)
    }
  }

  initialize() {
    this.resetCssSettings()
  }

  bindListeners() {
    ipc.answerMain('split', this.split)
    ipc.answerMain('close', this.state.tab.kill)
    ipc.answerMain('setting-changed', this.handleSettingChanged)
    ipc.answerMain('active-profile-changed', this.resetCssSettings)
  }
}
