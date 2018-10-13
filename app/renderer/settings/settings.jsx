/* global window */

import {remote} from 'electron'
import ipc from 'electron-better-ipc'
import React from 'react'
import {CompositeDisposable} from 'event-kit'
import TrafficLights from '../traffic-lights.jsx'
import HamburgerMenu from './hamburger-menu.jsx'
import Profiles from './profiles.jsx'
import PropertiesPane from './properties-pane.jsx'
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.subscriptions = new CompositeDisposable()
    this.state = {isDarkMode: remote.systemPreferences.isDarkMode()}
    remote.systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => this.setState({isDarkMode: remote.systemPreferences.isDarkMode()}),
    )

    ipc.answerMain('close', () => {
      return new Promise(resolve => {
        this.subscriptions.dispose()
        resolve()
      })
    })
  }

  render() {
    return <div id="settings" data-theme={this.theme}>
      <div id="titlebar"><TrafficLights /></div>
      <div className="form-container">
        <HamburgerMenu toggleProfilesDrawer={this.toggleProfilesDrawer.bind(this)}/>
        <Profiles showProfiles={this.state.showProfiles} />
        <div className="options-container"><PropertiesPane addSubscription={this.addSubscription.bind(this)} /></div>
      </div>
    </div>
  }

  componentDidMount() {
    ipc.answerMain('close-current-tab', () => window.close())
  }

  componentWillUnmount() {
    this.subscriptions.dispose()
  }

  toggleProfilesDrawer(active) {
    this.setState({showProfiles: active})
  }

  addSubscription(listener) {
    this.subscriptions.add(listener)
  }

  get theme() {
    if (this.state.isDarkMode) {
      return 'dark'
    }

    return 'light'
  }
}
