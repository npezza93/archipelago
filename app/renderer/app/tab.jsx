import React from 'react'
import Component from '../utils/component.jsx'

export default class Tab extends Component {
  render() {
    return <archipelago-tab class={this.className} onClick={this.handleClick}>
      <span>{this.props.title || 'Loading...'}</span>
      <div onClick={this.handleExit}>×</div>
    </archipelago-tab>
  }

  handleClick(event) {
    this.props.selectTab(event, this.props.id)
  }

  handleExit(event) {
    event.stopPropagation()
    this.props.removeTab(this.props.id)
  }

  get className() {
    if (this.props.active) {
      return 'active'
    }

    if (this.props.isUnread) {
      return 'is-unread'
    }

    return null
  }
}
