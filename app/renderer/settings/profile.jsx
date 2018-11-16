import React from 'react'
import autoBind from 'auto-bind'

export default class Profile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {editMode: false, name: this.props.name || 'New Profile'}
    autoBind(this)
  }

  render() {
    return (
      <archipelago-profile class={this.className}
        onDoubleClick={() => this.setState({editMode: true})}
        onClick={() => this.props.setActiveProfile(this.props.profile)}>
        {this.textOrInput()}
        {this.removeProfile()}
      </archipelago-profile>
    )
  }

  get className() {
    return (
      this.props.activeProfile.id === this.props.profile.id && 'active'
    ) || ''
  }

  textOrInput() {
    if (this.state.editMode) {
      return <input autoFocus type="text" value={this.state.name}
        onFocus={e => e.target.select()}
        onBlur={() => this.setState({editMode: false})}
        onChange={this.handleInputChange} />
    }

    return this.state.name
  }

  handleInputChange(event) {
    this.setState({name: event.target.value})

    return new Promise(resolve => {
      this.props.profile.name = event.target.value
      resolve()
    })
  }

  removeProfile() {
    return (
      <span className="profile-remove" onClick={this.handleRemoveProfile}>
        ×
      </span>
    )
  }

  handleRemoveProfile(event) {
    event.stopPropagation()
    this.props.removeProfile(this.props.profile)
  }
}
