/* global window */

import {ipcRenderer as ipc} from 'electron-better-ipc'
import React from 'react'
import {darkMode} from 'electron-util'
import {Disposable} from 'event-kit'
import Octicon, {ChevronLeft, ChevronRight} from '@githubprimer/octicons-react'
import Component from '../utils/component.jsx'
import BooleanField from '../utils/form/boolean-field.jsx'
import TextField from '../utils/form/text-field.jsx'
import TrafficLights from '../traffic-lights.jsx'
import './styles.css'

export default class Search extends Component {
  render() {
    return <div id="search" data-theme={this.theme}>
      <TrafficLights />
      <TextField
        property="search-query"
        autoFocus={true}
        value={this.state.query}
        onChange={this.handleQueryChange}
        onKeyPress={this.handleKeyPress}
        label="Search" />
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
      <BooleanField
        property="regex"
        label="Use regex"
        value={this.state.regex}
        onChange={this.handleRegexChange} />
      <BooleanField
        property="case"
        label="Case sensitive"
        value={this.state.caseSensitive}
        onChange={this.handlecaseSensitiveChange} />
      <BooleanField
        property="whole"
        label="Whole word"
        value={this.state.wholeWord}
        onChange={this.handlewholeWordChange} />
    </div>
  }

  initialState() {
    return {
      isDarkMode: darkMode.isEnabled,
      query: '',
      regex: false,
      caseSensitive: false,
      wholeWord: false
    }
  }

  handleQueryChange(query) {
    this.setState({query})
  }

  handleRegexChange(regex) {
    this.setState({regex})
  }

  handlecaseSensitiveChange(caseSensitive) {
    this.setState({caseSensitive})
  }

  handlewholeWordChange(wholeWord) {
    this.setState({wholeWord})
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

  bindListeners() {
    this.addSubscription(new Disposable(ipc.answerMain('search-next', this.searchNext)))
    this.addSubscription(new Disposable(ipc.answerMain('search-previous', this.searchPrevious)))

    this.addSubscription(
      new Disposable(darkMode.onChange(this.handleDarkModeChange.bind(this)))
    )

    ipc.on('close-via-menu', window.close)
    this.addSubscription(
      new Disposable(() => ipc.removeListener('close-via-menu', window.close))
    )
    ipc.answerMain('close', () => {
      return new Promise(resolve => {
        this.cleanup()
        resolve()
      })
    })
  }
}
