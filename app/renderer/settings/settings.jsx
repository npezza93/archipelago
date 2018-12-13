/* global window */
import ipc from 'electron-better-ipc'
import React from 'react'
import {darkMode} from 'electron-util'
import {Disposable} from 'event-kit'
import TrafficLights from '../traffic-lights.jsx'
import Component from '../utils/component.jsx'
import CurrentSettings from '../sessions/current-profile'
import HamburgerMenu from './hamburger-menu.jsx'
import OpenConfig from './open-config.jsx'
import Profiles from './profiles.jsx'
import PropertiesPane from './properties-pane.jsx'
import './styles.css' // eslint-disable-line import/no-unassigned-import

export default class Settings extends Component {
  render() {
    return <div id="settings" data-theme={this.theme}>
      <div id="titlebar"><TrafficLights /></div>
      <HamburgerMenu toggleProfilesDrawer={this.toggleProfilesDrawer}/>
      <OpenConfig />
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

  initialState() {
    return {isDarkMode: darkMode.isEnabled}
  }

  initialize() {
    this.currentProfile = new CurrentSettings()
  }

  toggleProfilesDrawer(active) {
    this.setState({showProfiles: active})
  }

  bindListeners() {
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
