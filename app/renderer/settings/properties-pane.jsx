import React from 'react'
import ipc from 'electron-better-ipc'
import schema from '../../common/schema'
import Component from '../utils/component.jsx'
import Header from './header.jsx'
import PropertiesSection from './properties-section.jsx'

export default class PropertiesPane extends Component {
  render() {
    return <archipelago-properties-pane>
      <Header headings={this.headings} root={this.state.headingRoot} />
      {this.headings.map(scope =>
        <PropertiesSection
          addSubscription={this.props.addSubscription}
          scope={scope}
          key={scope}
          properties={this._scopes[scope]}
          handleChange={this.handleChange}
          activeProfileId={this.state.activeProfileId}
          currentProfile={this.props.currentProfile} />
      )}
    </archipelago-properties-pane>
  }

  initialState() {
    return {
      headingRoot: this.headings[0],
      activeProfileId: this.props.currentProfile.activeProfileId
    }
  }

  initialize() {
    this._scopes = this.makeScopes()
    this.headings = Object.keys(this._scopes)
  }

  handleChange(heading) {
    this.setState({headingRoot: heading})
  }

  makeScopes() {
    const {properties} = schema.properties.profiles.items

    return Object.keys(properties).reduce((accumulator, property) => {
      const schema = properties[property]
      const enabledPlatforms = schema.enabledOn || [process.platform]

      if (schema.settings && enabledPlatforms.includes(process.platform)) {
        const {title} = schema.settings

        if (accumulator[title] === undefined) {
          accumulator[title] = {[property]: schema}
        } else {
          accumulator[title][property] = schema
        }
      }
      return accumulator
    }, {})
  }

  onActiveProfileChange() {
    this.setState({activeProfileId: this.props.currentProfile.activeProfileId})
  }

  bindListeners() {
    ipc.answerMain('active-profile-changed', this.onActiveProfileChange)
  }
}
