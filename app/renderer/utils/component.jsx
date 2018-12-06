/* global window */

import {darkMode} from 'electron-util'
import React from 'react'
import {CompositeDisposable} from 'event-kit'
import autoBind from 'auto-bind'

export default class Component extends React.Component {
  constructor(props) {
    super(props)
    autoBind(this)

    this.state = this.initialState()
    this.subscriptions = new CompositeDisposable()
    this.initialize()

    window.addEventListener('beforeunload', this.cleanup)
    this.bindListeners()
  }

  initialState() {
    return {}
  }

  cleanup() {
    this.subscriptions.dispose()
  }

  componentWillUnmount() {
    this.cleanup()
    window.removeEventListener('beforeunload', this.cleanup)
  }

  get theme() {
    if (this.state.isDarkMode) {
      return 'dark'
    }

    return 'light'
  }

  handleDarkModeChange() {
    this.setState({isDarkMode: darkMode.isEnabled})
  }

  addSubscription(listener) {
    this.subscriptions.add(listener)
  }

  bindListeners() {}

  initialize() {}
}
