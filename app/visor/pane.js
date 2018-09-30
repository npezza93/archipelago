const {Component, createElement} = require('react')
const SplitPane = require('react-split-pane')
const Terminal = require('./terminal')

module.exports =
class Pane extends Component {
  render() {
    return createElement(
      'archipelago-pane', {}, this.renderTree(this.props.sessionTree)
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
        removeSession: this.props.removeSession,
        selectSession: this.props.selectSession
      }
    )
  }
}
