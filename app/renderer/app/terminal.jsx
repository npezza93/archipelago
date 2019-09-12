/* global ResizeObserver */

import React from 'react'
import {Disposable} from 'event-kit'
import debouncer from 'debounce-fn'
import Component from '../utils/component.jsx'

export default class Terminal extends Component {
  render() {
    return <archipelago-terminal ref={this.setRef} />
  }

  setRef(container) {
    this.container = container
  }

  fit() {
    if (this.props.tabId === this.props.currentTabId) {
      debouncer(this.props.session.fit, {wait: 150})()
    }
  }

  componentDidMount() {
    const {session} = this.props

    session.attach(this.container)

    this.addSubscription(
      this.props.session.onFocus(() => {
        this.props.selectSession(this.props.session.id)
        this.props.changeTitle(this.props.tabId, this.props.session.title)
      })
    )

    this.resizeObserver.observe(this.container)
  }

  initialize() {
    this.resizeObserver = new ResizeObserver(this.fit)
  }

  bindListeners() {
    this.addSubscription(
      new Disposable(() => this.resizeObserver.unobserve(this.container))
    )

    this.addSubscription(
      this.props.session.onTitle(title => {
        this.props.changeTitle(this.props.tabId, title)
      })
    )

    this.addSubscription(
      this.props.session.onExit(() => {
        this.props.removeSession(this.props.tabId, this.props.session.id)
      })
    )

    this.addSubscription(
      this.props.session.onData(() => {
        if (this.props.currentTabId !== this.props.tabId) {
          this.props.markUnread(this.props.tabId)
        }
      })
    )
  }
}
