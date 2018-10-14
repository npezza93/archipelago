/* global window */

import {remote} from 'electron'
import ipc from 'electron-better-ipc'
import React from 'react'
import TrafficLights from '../traffic-lights.jsx'
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Search extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDarkMode: remote.systemPreferences.isDarkMode(),
      query: '',
      regex: false,
      caseSensitive: false,
      wholeWord: false
    }

    ipc.answerMain('close-current-tab', () => window.close())
    ipc.answerMain('search-next', () => this.searchNext())
    ipc.answerMain('search-previous', () => this.searchPrevious())
    remote.systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => this.setState({isDarkMode: remote.systemPreferences.isDarkMode()}),
    )
  }

  render() {
    return <div id="search" data-theme={this.theme}>
      <TrafficLights />
      <input-field>
        <input autoFocus
          type="text"
          value={this.state.query}
          onChange={this.handleQueryChange.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)} />
        <label>Search</label>
        <div className="input-border"></div>
      </input-field>
      <switch-field>
        <div>Use regex</div>
        <label>
          <input
            type="checkbox"
            checked={this.state.regex}
            onChange={this.handleRegexChange.bind(this)} />
          <span className="slider"></span>
        </label>
      </switch-field>
      <switch-field>
        <div>Case sensitive</div>
        <label>
          <input
            type="checkbox"
            checked={this.state.caseSensitive}
            onChange={this.handlecaseSensitiveChange.bind(this)} />
          <span className="slider"></span>
        </label>
      </switch-field>
      <switch-field>
        <div>Whole word</div>
        <label>
          <input
            type="checkbox"
            checked={this.state.wholeWord}
            onChange={this.handlewholeWordChange.bind(this)} />
          <span className="slider"></span>
        </label>
      </switch-field>
    </div>
  }

  handleQueryChange(event) {
    this.setState({query: event.target.value})
  }

  handleRegexChange(event) {
    this.setState({regex: event.target.checked})
  }

  handlecaseSensitiveChange(event) {
    this.setState({caseSensitive: event.target.checked})
  }

  handlewholeWordChange(event) {
    this.setState({wholeWord: event.target.checked})
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.searchNext()
    }
  }

  searchNext() {
    const {regex, wholeWord, caseSensitive} = this.state

    ipc.callMain('search-next', {
      query: this.state.query, options: {regex, wholeWord, caseSensitive}
    })
  }

  searchPrevious() {
    const {regex, wholeWord, caseSensitive} = this.state

    ipc.callMain('search-previous', {
      query: this.state.query, options: {regex, wholeWord, caseSensitive}
    })
  }

  get theme() {
    if (this.state.isDarkMode) {
      return 'dark'
    }

    return 'light'
  }
}
