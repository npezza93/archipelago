import React from 'react'
import ipc from 'electron-better-ipc'
import Profile from './profile.jsx'

export default class Profiles extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeProfileId: ipc.sendSync('activeProfileId'),
      profiles: ipc.sendSync('profiles')
    }
  }

  render() {
    return (
      <archipelago-profiles class={(this.props.showProfiles && 'active') || ''}>
        <div className="profile-header">Profiles</div>
        <div className="profile-list">
          {this.state.profiles.map(profile =>
            <Profile
              key={profile.attributes.id}
              profile={profile}
              removeProfile={this.removeProfile.bind(this)}
              setActiveProfile={this.setActiveProfile.bind(this)}
              activeProfileId={this.state.activeProfileId} />
          )}
        </div>
        <div className="new-profile" onClick={this.createProfile.bind(this)}>
          Add New Profile
        </div>
      </archipelago-profiles>
    )
  }

  async createProfile() {
    const {newProfile, profiles} = await ipc.callMain('create-profile')

    this.setState({profiles, activeProfileId: newProfile.attributes.id})
  }

  async removeProfile(profileId) {
    const {activeProfileId, profiles} = await ipc.callMain('destroy-profile', profileId)

    this.setState({profiles, activeProfileId})
  }

  setActiveProfile(activeProfileId) {
    this.setState({activeProfileId})

    ipc.callMain('set-active-profile', activeProfileId)
  }
}
