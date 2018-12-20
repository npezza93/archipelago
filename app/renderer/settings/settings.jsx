/* global window */
import ipc from 'npezza93-electron-better-ipc'
import React from 'react'
import {darkMode} from 'electron-util'
import {Disposable} from 'event-kit'
import TrafficLights from '../traffic-lights.jsx'
import Component from '../utils/component.jsx'
import CurrentProfile from '../utils/current-profile'
import HamburgerMenu from './hamburger-menu.jsx'
import OpenConfig from './open-config.jsx'
import ProfilesDrawer from './profiles-drawer.jsx'
import PropertiesPane from './properties-pane.jsx'
import './styles.css'

export default class Settings extends Component {
  render() {
    return <div id="settings" data-theme={this.theme}>
      <div id="titlebar"><TrafficLights /></div>
      <HamburgerMenu toggleProfilesDrawer={this.toggleProfilesDrawer}/>
      <OpenConfig pref={this.currentProfile.pref} />
      <ProfilesDrawer
        showProfiles={this.state.showProfiles}
        profiles={this.currentProfile.allProfiles}
        activeProfileId={this.currentProfile.activeProfileId} />
      <PropertiesPane
        currentProfile={this.currentProfile}
        addSubscription={this.addSubscription} />
    </div>
  }

  initialState() {
    return {isDarkMode: darkMode.isEnabled}
  }

  initialize() {
    this.currentProfile = new CurrentProfile()
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

    this.addSubscription(new Disposable(
      ipc.answerMain('close', () => {
        return new Promise(resolve => {
          this.cleanup()
          resolve()
        })
      })
    ))
  }
}
