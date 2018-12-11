/* global requestIdleCallback */

import React from 'react'
import ipc from 'electron-better-ipc'
import schema from '../../common/schema'
import Component from '../utils/component.jsx'
import Header from './header.jsx'
import PropertiesSection from './properties-section.jsx'

export default class PropertiesPane extends Component {
  render() {
    return <archipelago-properties-pane>
      <Header headings={this.state.headings} />
      {this.headings.map(scope =>
        <PropertiesSection
          addSubscription={this.props.addSubscription}
          scope={scope}
          key={scope}
          properties={this.scopes()[scope]}
          handleChange={this.handleChange}
          activeProfileId={this.state.activeProfileId}
          currentProfile={this.props.currentProfile} />
      )}
    </archipelago-properties-pane>
  }

  initialState() {
    return {
      headings: this.headings.reduce((headingState, heading) => {
        headingState[this.headings.indexOf(heading)] = heading
        return headingState
      }, {}),
      activeProfileId: this.props.currentProfile.activeProfileId
    }
  }

  initialize() {
    this.headings = Object.keys(this.scopes())
  }

  handleChange(inView, scope) {
    if (inView) {
      requestIdleCallback(() => {
        const enteringIndex = this.headings.indexOf(scope)
        const headerState = {}
        for (let index = 0; index < this.headings.length; index++) {
          const heading = this.headings[index]
          if (index === enteringIndex) {
            headerState[heading] = 0
          } else {
            let position = index - enteringIndex
            if (position > 1) {
              position = 1
            }
            if (position < -2) {
              position = -2
            }
            headerState[heading] = position
          }
        }

        this.setState({headings: headerState})
      })
    }
  }

  scopes() {
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
