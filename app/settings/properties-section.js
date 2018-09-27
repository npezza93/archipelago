/* global requestIdleCallback */
/* eslint guard-for-in: "off" */

const {Component, createElement} = require('react')
const Observer = require('@researchgate/react-intersection-observer').default

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
          this.renderProperties()
        )
      )
    )
  }

  renderProperties() {
    return Object.keys(this.props.properties).map(propertyName => {
      const schema = this.props.properties[propertyName]

      return createElement(Property, {key: propertyName, property: propertyName, schema})
    })
  }
}
