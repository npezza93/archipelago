/* global ResizeObserver */

import React from 'react'
import {CompositeDisposable} from 'event-kit'
import {debouncer} from '../../common/config-file'

export default class Terminal extends React.Component {
  constructor(props) {
    super(props)
    this.subscriptions = new CompositeDisposable()
    this.resizeObserver = new ResizeObserver(this.fit)

    this.bindDataListeners()
  }

  render() {
    return <archipelago-terminal ref={this.setRef.bind(this) } />
  }

  setRef(container) {
    this.container = container
  }

  fit() {
    if (this.props.tabId === this.props.currentTabId) {
      debouncer(() => this.props.session.fit(), 200)()
    }
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
        this.props.changeTitle(this.props.tabId, this.props.session.title)
      })
    )

    this.subscriptions.add(
      this.props.session.onTitle(title => {
        this.props.changeTitle(this.props.tabId, title)
      })
    )

    this.props.session.onExit(() => {
      this.props.removeSession(this.props.tabId, this.props.session.id)
    })

    this.subscriptions.add(
      this.props.session.onData(() => {
        if (this.props.currentTabId !== this.props.tabId) {
          this.props.markUnread(this.props.tabId)
        }
      })
    )
  }
}
