const {Component, createElement} = require('react')

module.exports =
class Pane extends Component {
  render() {
    return createElement(
      'archipelago-pane',
      {class: this.props.currentTabId === this.props.id ? undefined : 'hidden'},
      this.props.sessions.render(this.props)
    )
  }
}
