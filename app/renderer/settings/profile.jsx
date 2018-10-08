import React from 'react'
import ipc from 'electron-better-ipc'

export default class Profile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {editMode: false, name: this.props.profile.attributes.name}
  }

  render() {
    return (
      <archipelago-profile class={this.className}
        onDoubleClick={() => this.setState({editMode: true})}
        onClick={() => this.props.setActiveProfile(this.props.profile.attributes.id)}>
        {this.textOrInput()}
        {this.removeProfile()}
      </archipelago-profile>
    )
  }

  get className() {
    return (
      this.props.activeProfileId === this.props.profile.attributes.id && 'active'
    ) || ''
  }

  textOrInput() {
    if (this.state.editMode) {
      return <input autoFocus type="text" value={this.state.name}
        onFocus={e => e.target.select()}
        onBlur={() => this.setState({editMode: false})}
        onChange={this.handleInputChange.bind(this)} />
    }

    return this.state.name
  }

  handleInputChange(event) {
    const data = {
      id: this.props.profile.attributes.id,
      prefName: 'name',
      prefValue: event.target.value
    }

    this.setState({name: data.prefValue})
    ipc.callMain('set-profile-pref', data)
  }

  removeProfile() {
    return (
      <span className="profile-remove" onClick={this.handleRemoveProfile.bind(this)}>
        ×
      </span>
    )
  }

  handleRemoveProfile(event) {
    event.stopPropagation()
    this.props.removeProfile(this.props.profile.attributes.id)
  }
}
