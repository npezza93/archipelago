/* global window */
import {ipcRenderer as ipc} from 'electron-better-ipc'
import React from 'react'
import {darkMode} from 'electron-util'
import {Disposable} from 'event-kit'
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
      <div id="titlebar"></div>
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
    const boundChanger = this.handleDarkModeChange.bind(this)
    ipc.on('dark-mode-changed', boundChanger)
    this.addSubscription(
      new Disposable(() => ipc.removeListener('dark-mode-changed', boundChanger))
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
