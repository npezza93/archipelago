const {
  Component,
  createElement,
} = require('react');

module.exports = class Tab extends Component {
  render() {
    return createElement(
      'archipelago-tab', {
        class: this.class(),
        onClick: e => this.props.selectTab(e, this.props.id),
      },
      createElement('span', {}, this.props.title || 'Loading...'),
      this.exit(),
    );
  }

  exit() {
    return createElement(
      'div', {
        onClick: (e) => {
          e.stopPropagation();
          this.props.removeTab(this.props.id);
        },
      },
      '\u00D7',
    );
  }

  class() {
    if (this.props.active) {
      return 'active';
    }

    if (this.props.isUnread) {
      return 'is-unread';
    }
  }
};
