/* global window */

import ipc from 'electron-better-ipc'
import React from 'react'

/* eslint-disable import/no-unresolved */
import TrafficLights from 'common/traffic-lights'
import HamburgerMenu from '@/settings/hamburger-menu'
import Profiles from '@/settings/profiles'
import '@/settings/styles' // eslint-disable-line import/no-unassigned-import
/* eslint-enable import/no-unresolved */

export default class Settings extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return <div>
      <div id="titlebar"><TrafficLights /></div>
      <div className="form-container">
        <HamburgerMenu toggleProfiles={this.toggleProfiles.bind(this)}/>
        <Profiles showProfiles={this.state.showProfiles} />
        <div className="options-container"></div>
      </div>
    </div>
  }

  componentDidMount() {
    ipc.answerMain('close-current-tab', () => window.close())
  }

  toggleProfiles(active) {
    this.setState({showProfiles: active})
  }
}
