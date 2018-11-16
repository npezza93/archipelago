/* global window */

import ipc from 'electron-better-ipc'
import React from 'react'
import {darkMode} from 'electron-util'
import autoBind from 'auto-bind'
import Octicon, {ChevronLeft, ChevronRight} from '@githubprimer/octicons-react'
import TrafficLights from '../traffic-lights.jsx'
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Search extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isDarkMode: darkMode.isEnabled,
      query: '',
      regex: false,
      caseSensitive: false,
      wholeWord: false
    }

    ipc.answerMain('close-current-tab', () => window.close())
    ipc.answerMain('search-next', () => this.searchNext())
    ipc.answerMain('search-previous', () => this.searchPrevious())
    darkMode.onChange(() => this.setState({isDarkMode: darkMode.isEnabled}))
    autoBind(this)
  }

  render() {
    return <div id="search" data-theme={this.theme}>
      <TrafficLights />
      <input-field>
        <input autoFocus
          type="text"
          value={this.state.query}
          onChange={this.handleQueryChange}
          onKeyPress={this.handleKeyPress} />
        <label>Search</label>
        <div className="input-border"></div>
      </input-field>
      <div id="search-buttons">
        <div id="search-previous-button" onClick={this.searchPrevious}>
          <Octicon icon={ChevronLeft} />
          Previous
        </div>
        <div id="search-next-button" onClick={this.searchNext}>
          Next
          <Octicon icon={ChevronRight} />
        </div>
      </div>
      <switch-field>
        <div>Use regex</div>
        <label>
          <input
            type="checkbox"
            checked={this.state.regex}
            onChange={this.handleRegexChange} />
          <span className="slider"></span>
        </label>
      </switch-field>
      <switch-field>
        <div>Case sensitive</div>
        <label>
          <input
            type="checkbox"
            checked={this.state.caseSensitive}
            onChange={this.handlecaseSensitiveChange} />
          <span className="slider"></span>
        </label>
      </switch-field>
      <switch-field>
        <div>Whole word</div>
        <label>
          <input
            type="checkbox"
            checked={this.state.wholeWord}
            onChange={this.handlewholeWordChange} />
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
