const {Component, createElement} = require('react')
const Pane = require('./pane')

module.exports =
class PaneList extends Component {
  render() {
    return createElement(
      'archipelago-pane-list',
      {},
      this.props.tabs.map(tab => {
        return createElement(
          Pane, {
            id: tab.id,
            key: tab.id,
            sessions: tab.sessions,
            currentTabId: this.props.currentTabId,
            currentSessionId: this.props.currentSessionId,
            changeTitle: this.props.changeTitle,
            markUnread: this.props.markUnread,
            removeSession: this.props.removeSession,
            selectSession: this.props.selectSession
          }
        )
      })
    )
  }
}
