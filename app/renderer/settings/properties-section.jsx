import React from 'react'
import Observer from '@researchgate/react-intersection-observer'
import Component from '../utils/component.jsx'
import Property from './property.jsx'

export default class PropertiesSection extends Component {
  render() {
    return <Observer tag="archipelago-properties-section" threshold={this.thresholds}
      onChange={this.handleInstersection}>
      <archipelago-properties-section>
        <archipelago-properties-section-container>
          {this.renderProperties(this.props.properties, '')}
        </archipelago-properties-section-container>
      </archipelago-properties-section>
    </Observer>
  }

  get thresholds() {
    return [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
  }

  renderProperties(properties, prefix) {
    return Object.keys(properties).map(propertyName => {
      const schema = properties[propertyName]
      let property

      if (schema.type === 'object') {
        property = this.renderProperties(schema.properties, propertyName)
      } else {
        const path = [prefix, propertyName].filter(partialPath => {
          return partialPath.length > 0
        }).join('.')
        const enabledPlatforms = schema.enabledOn || [process.platform]

        if (enabledPlatforms.includes(process.platform)) {
          property = <Property
            addSubscription={this.props.addSubscription}
            currentProfile={this.props.currentProfile}
            activeProfileId={this.props.activeProfileId}
            schema={schema} key={path} property={path} />
        }
      }

      return property
    })
  }

  handleInstersection(event) {
    const {intersectionRatio, isIntersecting} = event

    if (isIntersecting && intersectionRatio > this.previousRatio) {
      this.props.handleChange(this.props.scope)
    }

    this.previousRatio = intersectionRatio
  }
}
