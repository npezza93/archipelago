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
    debouncer(this.props.session.fit, {wait: 150})()
  }

  componentDidMount() {
    const {session} = this.props

    session.attach(this.container)

    this.resizeObserver.observe(this.container)
  }

  initialize() {
    this.resizeObserver = new ResizeObserver(this.fit)
  }

  bindDataListeners() {
    this.addSubscription(
      new Disposable(() => this.resizeObserver.unobserve(this.container))
    )
    this.addSubscription(
      this.props.session.onFocus(() => {
        this.props.selectSession(this.props.session.id)
      })
    )

    this.props.session.onExit(() => {
      this.props.removeSession(this.props.session.id)
    })
  }
}
