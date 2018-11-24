/* global document, window */

import ipc from 'electron-better-ipc'
import React from 'react'
import autoBind from 'auto-bind'
import Tab from '../sessions/tab'
import Pane from './pane.jsx'
import 'xterm/dist/xterm.css' // eslint-disable-line import/no-unassigned-import
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Visor extends React.Component {
  constructor(props) {
    super(props)
    autoBind(this)

    this.state = {tab: new Tab('visor')}

    ipc.answerMain('split', direction => this.split(direction))
    ipc.answerMain('close', () => this.state.tab.kill())
    const styles = document.documentElement.style
    const styleProperties = {
      fontFamily: '--font-family',
      'visor.windowBackground': '--background-color',
      fontSize: '--font-size',
      'visor.padding': '--terminal-padding',
      'theme.selection': '--selection-color'
    }

    ipc.callMain('visor-css-settings').then(settings => {
      for (const property in styleProperties) {
        styles.setProperty(styleProperties[property], settings[property])
      }
    })
    ipc.answerMain('setting-changed', ({property, value}) => {
      if (property in styleProperties) {
        styles.setProperty(styleProperties[property], value)
      }
    })
  }

  render() {
    return <archipelago-visor class={this.htmlClasses()}>
      <Pane
        id={this.state.tab.id}
        sessionTree={this.state.tab.root}
        removeSession={this.removeSession}
        selectSession={this.selectSession} />
    </archipelago-visor>
  }

  htmlClasses() {
    return `${process.platform} single-tab-mode`
  }

  componentWillUnmount() {
    this.state.tab.kill()
  }

  selectSession(id) {
    return this.setState({currentSessionId: id})
  }

  removeSession(sessionId) {
    const {tab} = this.state

    tab.remove(sessionId)
    if (tab.root === null) {
      this.state.tab.kill().then(() => window.close())
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
}
