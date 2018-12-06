import ipc from 'electron-better-ipc'
import React from 'react'
import Component from '../utils/component.jsx'
import Profile from './profile.jsx'

export default class Profiles extends Component {
  render() {
    return (
      <archipelago-profiles class={(this.props.showProfiles && 'active') || ''}>
        <div className="profile-header">Profiles</div>
        <div className="profile-list">
          {this.state.profiles.map(profile =>
            <Profile
              key={profile.id}
              id={profile.id}
              name={profile.name}
              removeProfile={this.removeProfile}
              setActiveProfile={this.setActiveProfile}
              activeProfileId={this.state.activeProfileId} />
          )}
        </div>
        <div className="new-profile" onClick={this.createProfile}>
          Add New Profile
        </div>
      </archipelago-profiles>
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
