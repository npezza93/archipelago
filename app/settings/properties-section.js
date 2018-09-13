/* eslint guard-for-in: "off" */

const {Component, createElement} = require('react')
const Property = require('./property')

module.exports =
class PropertiesSection extends Component {
  render() {
    return createElement(
      'archipelago-properties-section',
      {ref: this.props.innerRef},
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

  seperator(groupNumber) {
    return createElement('div', {key: groupNumber, className: 'seperator'})
  }
}
