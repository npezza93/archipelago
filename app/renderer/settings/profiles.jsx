import {remote} from 'electron'
import React from 'react'
import Profile from './profile.jsx'

export default class Profiles extends React.Component {
  constructor(props) {
    super(props)

    this.profileManager = remote.getGlobal('profileManager')
    this.state = {
      activeProfile: this.profileManager.activeProfile(),
      profiles: this.profileManager.all()
    }
  }

  render() {
    return (
      <archipelago-profiles class={(this.props.showProfiles && 'active') || ''}>
        <div className="profile-header">Profiles</div>
        <div className="profile-list">
          {this.state.profiles.map(profile =>
            <Profile
              key={profile.id}
              profile={profile}
              removeProfile={this.removeProfile.bind(this)}
              setActiveProfile={this.setActiveProfile.bind(this)}
              activeProfile={this.state.activeProfile} />
          )}
        </div>
        <div className="new-profile" onClick={this.createProfile.bind(this)}>
          Add New Profile
        </div>
      </archipelago-profiles>
    )
  }

  createProfile() {
    const newProfile = this.profileManager.create()
    const profiles = this.profileManager.all()

    this.setState({profiles, activeProfile: newProfile})
  }

  removeProfile(profile) {
    if (this.profileManager.activeProfile().id === profile.id) {
      const newActiveProfileId = this.profileManager.profileIds.find(profileId => {
        return profileId !== profile.id
      })
      this.profileManager.resetActiveProfile(newActiveProfileId)
    }

    profile.destroy()

    this.setState({activeProfile: this.profileManager.activeProfile(),
      profiles: this.profileManager.all()})
  }

  setActiveProfile(activeProfile) {
    this.setState({activeProfile})

    return new Promise(resolve => {
      this.profileManager.activeProfileId = activeProfile.id
      resolve()
    })
  }
}
