import {Component, createElement} from 'react'

import Tab from '@/tab'

export default class TabList extends Component {
  render() {
    return createElement(
      'archipelago-tab-list',
      {},
      this.props.tabs.map(tab => {
        return createElement(
          Tab, {
            id: tab.id,
            key: tab.id,
            title: tab.title,
            isUnread: tab.isUnread,
            active: this.props.currentTabId === tab.id,
            selectTab: this.props.selectTab,
            removeTab: this.props.removeTab
          }
        )
      })
    )
  }
}
