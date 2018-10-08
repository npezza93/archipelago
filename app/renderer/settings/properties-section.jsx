import React from 'react'
import Observer from '@researchgate/react-intersection-observer'

/* eslint-disable import/no-unresolved */
import Property from '@/settings/property'
/* eslint-enable import/no-unresolved */

export default class PropertiesSection extends React.Component {
  render() {
    return <Observer tag="archipelago-properties-section"
      onChange={e => this.props.handleChange(e.isIntersecting, this.props.scope)}>
      <archipelago-properties-section>
        <archipelago-properties-section-container>
          {this.renderProperties(this.props.properties, '')}
        </archipelago-properties-section-container>
      </archipelago-properties-section>
    </Observer>
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

        property = <Property schema={schema} key={path} property={path} />
      }

      return property
    })
  }
}
