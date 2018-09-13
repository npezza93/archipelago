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
        this.renderGroups()
      )
    )
  }

  renderGroups() {
    const group = []
    const object = this.groupedProperties()
    for (const section in object) {
      const properties = object[section]
      group.push(this.renderProperties(properties).concat(this.seperator(section)))
    }
    return group
  }

  renderProperties(properties) {
    return properties.map(property => {
      const group = []
      for (const name in property) {
        const schema = property[name]
        group.push(createElement(Property, {key: name, property: name, schema}))
      }
      return group
    })
  }

  seperator(groupNumber) {
    return createElement('div', {key: groupNumber, className: 'seperator'})
  }

  groupedProperties() {
    const properties = {}

    for (const property in this.props.properties) {
      const schema = this.props.properties[property]
      if (properties[schema.settings.group] === null || properties[schema.settings.group] === undefined) {
        properties[schema.settings.group] = []
      }
      properties[schema.settings.group].push({[property]: schema})
    }

    return properties
  }
}
