/* global window */

const {ipcRenderer} = require('electron')
const React = require('react')

const Tab = require('../sessions/tab')
const PaneList = require('./pane-list')

module.exports =
class App extends React.Component {
  constructor(props) {
    super(props)

    this.pref = this.props.pref()
    this.state = {tab: new Tab(this.pref, 'visor')}

    ipcRenderer.on('split-horizontal', () => this.split('horizontal'))
    ipcRenderer.on('split-vertical', () => this.split('vertical'))
  }

  render() {
    return React.createElement(
      'archipelago-app', {
        class: process.platform,
        'data-single-tab-mode': ''
      },
      React.createElement(
        PaneList, {
          key: 'panes',
          tab: this.state.tab,
          currentSessionId: this.state.currentSessionId,
          removeSession: this.removeSession.bind(this),
          selectSession: this.selectSession.bind(this)
        }
      )
    )
  }

  componentWillUnmount() {
    this.state.tab.kill()
    this.pref.dispose()
  }

  componentDidUpdate() {
    const currentSession = this.state.tab.find(
      this.state.tab.root, this.state.currentSessionId
    )

    if (currentSession && !currentSession.isFocused) {
      return currentSession.xterm.focus()
    }
  }

  selectSession(id) {
    return this.setState({currentSessionId: id})
  }

  removeSession(sessionId) {
    const {tab} = this.state

    tab.remove(sessionId)
    if (tab.root === null) {
      this.state.tab.kill()

      window.close()
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
