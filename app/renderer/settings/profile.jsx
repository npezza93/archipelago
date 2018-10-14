import React from 'react'

export default class Profile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {editMode: false, name: this.props.profile.name}
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
        onChange={this.handleInputChange.bind(this)} />
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
      <span className="profile-remove" onClick={this.handleRemoveProfile.bind(this)}>
        ×
      </span>
    )
  }

  handleRemoveProfile(event) {
    event.stopPropagation()
    this.props.removeProfile(this.props.profile)
  }
}
