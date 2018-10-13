/* global document, window */

import {remote} from 'electron'
import {CompositeDisposable} from 'event-kit'
import ipc from 'electron-better-ipc'
import React from 'react'
import Tab from '../sessions/tab'
import Pane from './pane.jsx'
import 'xterm/dist/xterm.css' // eslint-disable-line import/no-unassigned-import
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Visor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {tab: new Tab('visor')}
    this.subscriptions = new CompositeDisposable()

    ipc.answerMain('split', direction => this.split(direction))
  }

  render() {
    return <archipelago-visor class={process.platform} data-single-tab-mode>
      <Pane
        id={this.state.tab.id}
        sessionTree={this.state.tab.root}
        removeSession={this.removeSession.bind(this)}
        selectSession={this.selectSession.bind(this)} />
    </archipelago-visor>
  }

  componentDidMount() {
    const styles = document.documentElement.style
    const profileManager = remote.getGlobal('profileManager')
    const styleProperties = {
      fontFamily: '--font-family',
      'visor.windowBackground': '--background-color',
      fontSize: '--font-size',
      'visor.padding': '--terminal-padding',
      'theme.selection': '--selection-color'
    }

    for (const property in styleProperties) {
      styles.setProperty(styleProperties[property], profileManager.get(property))
      this.subscriptions.add(
        profileManager.onDidChange(property, newValue => {
          styles.setProperty(property, newValue)
        })
      )
    }
  }

  componentWillUnmount() {
    this.subscriptions.dispose()
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
