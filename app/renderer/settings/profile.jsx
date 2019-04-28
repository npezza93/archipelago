import {ipcRenderer as ipc} from 'electron-better-ipc'
import React from 'react'
import Octicon, {X} from '@githubprimer/octicons-react'
import Component from '../utils/component.jsx'
import './profile.css'

export default class Profile extends Component {
  render() {
    return (
      <profile-container class={this.className}
        onDoubleClick={this.enableEditMode}
        onClick={this.handleClick}>
        {this.textOrInput()}
        {this.removeProfile()}
      </profile-container>
    )
  }

  initialState() {
    return {editMode: false, name: this.props.name || 'New Profile'}
  }

  enableEditMode() {
    this.setState({editMode: true})
  }

  disableEditMode() {
    this.setState({editMode: false})
  }

  handleClick() {
    this.props.setActiveProfile(this.props.id)
  }

  get className() {
    return (this.props.activeProfileId === this.props.id && 'active') || ''
  }

  textOrInput() {
    if (this.state.editMode) {
      return <input autoFocus type="text" value={this.state.name}
        onFocus={this.handleFocus}
        onBlur={this.disableEditMode}
        onChange={this.handleInputChange} />
    }

    return this.state.name
  }

  handleFocus(event) {
    event.target.select()
  }

  handleInputChange(event) {
    this.setState({name: event.target.value})

    ipc.callMain('set-profile-name', {id: this.props.id, name: event.target.value})
  }

  removeProfile() {
    return (
      <remove-profile onClick={this.handleRemoveProfile}>
        <Octicon icon={X} />
      </remove-profile>
    )
  }

  handleRemoveProfile(event) {
    event.stopPropagation()
    this.props.removeProfile(this.props.id)
  }
}
