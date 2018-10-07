import React from 'react'
import SplitPane from 'react-split-pane'

import Terminal from '@/terminal'

export default class Pane extends React.Component {
  render() {
    return <archipelago-pane class={this.className}>
      {this.renderTree(this.props.sessionTree)}
    </archipelago-pane>
  }

  get className() {
    return (this.props.currentTabId !== this.props.id && 'hidden') || undefined
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
    return <SplitPane split={branch.orientation} defaultSize="50%">
      {this.renderTree(branch.left)}
      {this.renderTree(branch.right)}
    </SplitPane>
  }

  renderSession(session) {
    return <Terminal
      session={session}
      key={session.id}
      tabId={this.props.id}
      currentTabId={this.props.currentTabId}
      changeTitle={this.props.changeTitle}
      markUnread={this.props.markUnread}
      removeSession={this.props.removeSession}
      selectSession={this.props.selectSession} />
  }
}
