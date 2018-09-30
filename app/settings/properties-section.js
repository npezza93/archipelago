/* global requestIdleCallback */

const {Component, createElement} = require('react')
const {default: Observer} = require('@researchgate/react-intersection-observer')

const Property = require('./property')

module.exports =
class PropertiesSection extends Component {
  render() {
    return createElement(
      Observer,
      {
        tag: 'archipelago-properties-section',
        onChange: event => {
          requestIdleCallback(() => {
            this.props.handleChange(event.isIntersecting, this.props.scope)
          })
        }
      },
      createElement(
        'archipelago-properties-section',
        {},
        createElement(
          'archipelago-properties-section-container',
          {},
          this.renderProperties(this.props.properties, '')
        )
      )
    )
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

        property = createElement(Property, {schema, key: path, property: path})
      }

      return property
    })
  }
}
