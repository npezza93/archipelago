import React from 'react'
import Component from '../utils/component.jsx'
import Tab from './tab.jsx'

export default class TabList extends Component {
  render() {
    return <archipelago-tab-list>
      {this.props.tabs.map(tab => (
        <Tab
          id={tab.id}
          key={tab.id}
          title={tab.title}
          isUnread={tab.isUnread}
          active={this.props.currentTabId === tab.id}
          selectTab={this.props.selectTab}
          removeTab={this.props.removeTab} />
      ))}
    </archipelago-tab-list>
  }
}
