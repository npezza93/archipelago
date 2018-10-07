import React from 'react'
import SplitPane from 'react-split-pane'

import Terminal from '@/visor/terminal' // eslint-disable-line import/no-unresolved

export default class Pane extends React.Component {
  render() {
    return <archipelago-pane>
      {this.renderTree(this.props.sessionTree)}
    </archipelago-pane>
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
      removeSession={this.props.removeSession}
      selectSession={this.props.selectSession} />
  }
}
