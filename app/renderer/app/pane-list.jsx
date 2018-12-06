import React from 'react'
import Component from '../utils/component.jsx'
import Pane from './pane.jsx'

export default class PaneList extends Component {
  render() {
    return <archipelago-pane-list>
      {this.props.tabs.map(tab => (
        <Pane
          id={tab.id}
          key={tab.id}
          sessionTree={tab.root}
          currentTabId={this.props.currentTabId}
          changeTitle={this.props.changeTitle}
          markUnread={this.props.markUnread}
          removeSession={this.props.removeSession}
          selectSession={this.props.selectSession} />
      ))}
    </archipelago-pane-list>
  }
}
