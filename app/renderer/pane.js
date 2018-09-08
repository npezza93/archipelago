const {Component, createElement} = require('react')
const SplitPane = require('react-split-pane')
const Terminal = require('./terminal')

module.exports =
class Pane extends Component {
  render() {
    return createElement(
      'archipelago-pane',
      {class: this.props.currentTabId === this.props.id ? undefined : 'hidden'},
      this.renderTree(this.props.sessions.root)
    )
  }

  renderTree(object) {
    switch (object.constructor.name) {
      case 'Branch':
        return this.renderBranch(object)
      case 'Session':
        return this.renderSession(object)
      default:
        return null
    }
  }

  renderBranch(branch) {
    return createElement(
      SplitPane,
      {split: branch.orientation, defaultSize: '50%'},
      this.renderTree(branch.left),
      this.renderTree(branch.right)
    )
  }

  renderSession(session) {
    return createElement(
      Terminal,
      {
        session,
        key: session.id,
        tabId: this.props.id,
        currentTabId: this.props.currentTabId,
        changeTitle: this.props.changeTitle,
        markUnread: this.props.markUnread,
        removeSession: this.props.removeSession,
        selectSession: this.props.selectSession
      }
    )
  }
}
