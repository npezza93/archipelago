import React from 'react'

export default class Tab extends React.Component {
  render() {
    return <archipelago-tab class={this.className} onClick={this.handleClick.bind(this)}>
      <span>{this.props.title || 'Loading...'}</span>
      <div onClick={this.handleExit.bind(this)}>×</div>
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
