/* eslint guard-for-in: "off" */

const {Component, createElement} = require('react')
const Observer = require('react-intersection-observer')

const Property = require('./property')

module.exports =
class PropertiesSection extends Component {
  render() {
    return createElement(
      Observer,
      {
        tag: 'archipelago-properties-section',
        threshold: [0.1, 0.5],
        onChange: inView => {
          this.props.onChange(inView, this.props.scope)
        }
      },
      createElement(
        'archipelago-properties-section-container',
        null,
        this.renderProperties()
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
