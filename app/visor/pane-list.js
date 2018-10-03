const {
  Component,
  createElement,
} = require('react');
const Pane = require('./pane');

module.exports = class PaneList extends Component {
  render() {
    return createElement(
      'archipelago-pane-list', {},
      createElement(
        Pane, {
          id: this.props.tab.id,
          key: this.props.tab.id,
          sessionTree: this.props.tab.root,
          currentSessionId: this.props.currentSessionId,
          removeSession: this.props.removeSession,
          selectSession: this.props.selectSession,
        },
      ),
    );
  }
};
