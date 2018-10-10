/* global document, window */

import ipc from 'electron-better-ipc'
import React from 'react'
import Tab from '../../common/tab'
import Pane from './pane.jsx'
import 'xterm/dist/xterm.css' // eslint-disable-line import/no-unassigned-import
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Visor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {tab: new Tab('visor')}

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
    const styleProperties = {
      fontFamily: '--font-family',
      'visor.windowBackground': '--background-color',
      fontSize: '--font-size',
      'visor.padding': '--terminal-padding',
      'theme.selection': '--selection-color'
    }

    const preferences = ipc.sendSync('get-preferences-sync', Object.keys(styleProperties))
    Object.keys(preferences).forEach(preference => {
      styles.setProperty(styleProperties[preference], preferences[preference])
    })

    ipc.answerMain('preference-change', (preference, newValue) => {
      if (styleProperties[preference]) {
        styles.setProperty(styleProperties[preference], newValue)
      }
    })
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
