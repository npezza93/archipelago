/* global window */
import ipc from 'electron-better-ipc'
import React from 'react'
import {darkMode} from 'electron-util'
import {CompositeDisposable} from 'event-kit'
import autoBind from 'auto-bind'
import TrafficLights from '../traffic-lights.jsx'
import CurrentSettings from '../sessions/current-profile'
import HamburgerMenu from './hamburger-menu.jsx'
import Profiles from './profiles.jsx'
import PropertiesPane from './properties-pane.jsx'
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.subscriptions = new CompositeDisposable()
    this.state = {isDarkMode: darkMode.isEnabled}
    this.currentProfile = new CurrentSettings()
    darkMode.onChange(() => this.setState({isDarkMode: darkMode.isEnabled}))

    ipc.answerMain('close-via-menu', () => {
      this.subscriptions.dispose()
      window.close()
    })
    ipc.answerMain('close', () => {
      return new Promise(resolve => {
        this.subscriptions.dispose()
        resolve()
      })
    })
    autoBind(this)
  }

  render() {
    return <div id="settings" data-theme={this.theme}>
      <div id="titlebar"><TrafficLights /></div>
      <HamburgerMenu toggleProfilesDrawer={this.toggleProfilesDrawer}/>
      <Profiles
        showProfiles={this.state.showProfiles}
        profiles={this.currentProfile.allProfiles}
        activeProfileId={this.currentProfile.activeProfileId} />
      <div className="options-container">
        <PropertiesPane
          currentProfile={this.currentProfile}
          addSubscription={this.addSubscription} />
      </div>
    </div>
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
