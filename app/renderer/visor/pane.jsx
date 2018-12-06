import React from 'react'
import SplitPane from 'react-split-pane'
import Component from '../utils/component.jsx'
import Terminal from './terminal.jsx'

export default class Pane extends Component {
  render() {
    return <archipelago-pane>
      {this.renderTree(this.props.sessionTree)}
    </archipelago-pane>
  }

  renderTree(object) {
    switch (object.className) {
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
      key={session.id}
      session={session}
      removeSession={this.props.removeSession}
      selectSession={this.props.selectSession} />
  }
}
