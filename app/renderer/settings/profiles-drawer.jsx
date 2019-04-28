import {ipcRenderer as ipc} from 'electron-better-ipc'
import React from 'react'
import Component from '../utils/component.jsx'
import Profile from './profile.jsx'
import './profiles-drawer.css'

export default class ProfilesDrawer extends Component {
  render() {
    return (
      <profiles-drawer class={(this.props.showProfiles && 'active') || ''}>
        <profiles-header>Profiles</profiles-header>
        <profiles-list>
          {this.state.profiles.map(profile =>
            <Profile
              key={profile.id}
              id={profile.id}
              name={profile.name}
              removeProfile={this.removeProfile}
              setActiveProfile={this.setActiveProfile}
              activeProfileId={this.state.activeProfileId} />
          )}
        </profiles-list>
        <create-profile onClick={this.createProfile}>Add New Profile</create-profile>
      </profiles-drawer>
    )
  }

  initialState() {
    return {
      activeProfileId: this.props.activeProfileId, profiles: this.props.profiles
    }
  }

  createProfile() {
    ipc.callMain('create-profile').then(({profiles, activeProfileId}) => {
      this.setState({profiles, activeProfileId})
    })
  }

  removeProfile(profileId) {
    ipc.callMain('remove-profile', profileId).then(({profiles, activeProfileId}) => {
      this.setState({profiles, activeProfileId})
    })
  }

  setActiveProfile(activeProfileId) {
    this.setState({activeProfileId})

    ipc.callMain('set-active-profile', activeProfileId)
  }
}
