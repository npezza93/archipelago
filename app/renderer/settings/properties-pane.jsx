/* global requestIdleCallback */

import React from 'react'
import autoBind from 'auto-bind'
import schema from '../../common/schema'
import Header from './header.jsx'
import PropertiesSection from './properties-section.jsx'

export default class PropertiesPane extends React.Component {
  constructor(props) {
    super(props)
    autoBind(this)

    this.headings = Object.keys(this.scopes())
    this.state = {
      headings: this.headings.reduce((headingState, heading) => {
        headingState[this.headings.indexOf(heading)] = heading
        return headingState
      }, {})
    }
  }

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
          currentProfile={this.props.currentProfile} />
      )}
    </archipelago-properties-pane>
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

      if (schema.settings) {
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
}
