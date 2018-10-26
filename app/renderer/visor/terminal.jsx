/* global ResizeObserver */

import React from 'react'
import {CompositeDisposable} from 'event-kit'

export default class Terminal extends React.Component {
  constructor(props) {
    super(props)
    this.subscriptions = new CompositeDisposable()
    this.resizeObserver = new ResizeObserver(() => this.props.session.fit())

    this.bindDataListeners()
  }

  render() {
    return <archipelago-terminal ref={this.setRef.bind(this) } />
  }

  setRef(container) {
    this.container = container
  }

  componentDidMount() {
    const {session} = this.props

    session.xterm.open(this.container)
    session.resetTheme()
    session.xterm.focus()

    this.resizeObserver.observe(this.container)
    this.subscriptions.add(this.props.session.bindScrollListener())
  }

  componentWillUnmount() {
    this.resizeObserver.unobserve(this.container)
    this.subscriptions.dispose()
  }

  bindDataListeners() {
    this.subscriptions.add(
      this.props.session.onFocus(() => {
        this.props.selectSession(this.props.session.id)
      })
    )

    this.props.session.onExit(() => {
      this.props.removeSession(this.props.session.id)
    })
  }
}
