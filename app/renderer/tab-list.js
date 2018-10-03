const {
  Component,
  createElement,
} = require('react');
const Tab = require('./tab');

module.exports = class TabList extends Component {
  render() {
    return createElement(
      'archipelago-tab-list', {},
      this.props.tabs.map(tab => createElement(
        Tab, {
          id: tab.id,
          key: tab.id,
          title: tab.title,
          isUnread: tab.isUnread,
          active: this.props.currentTabId === tab.id,
          selectTab: this.props.selectTab,
          removeTab: this.props.removeTab,
        },
      )),
    );
  }
};
