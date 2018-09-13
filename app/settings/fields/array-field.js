/* eslint guard-for-in: "off" */

const React = require('react')
const {singularize} = require('i')
const coreFields = require('../core-fields')

module.exports =
class ArrayField {
  render() {
    const elements = this.props.value.map((element, i) =>
      this.renderElement(element, i))

    return elements.concat(this.addElement())
  }

  renderElement(element, index) {
    return React.createElement(
      'div', {
        key: index,
        className: 'array-element-container'
      },
      this.renderItems(element, index),
      this.removeElement(index)
    )
  }

  renderItems(value, index) {
    if (this.props.schema.items.type === 'object') {
      const result = []
      for (const property in this.props.schema.items.properties) {
        const propertySchema = this.props.schema.items.properties[property]
        result.push(this.renderItem(property, value[property], propertySchema, index))
      }
      return result
    }

    return this.renderItem(this.props.property, value, this.props.schema.items, index)
  }

  renderItem(property, value, schema, index) {
    return coreFields[schema.type].call(
      this,
      property,
      value,
      schema,
      newValue => {
        this.props.value[index][property] = newValue
        return this.props.onChange.call(this, this.props.value)
      }
    )
  }

  addElement() {
    return React.createElement(
      'div', {
        key: Math.random(),
        className: 'create-array-element',
        onClick: this.createElement.bind(this)
      },
      `add new ${singularize(this.props.property)}`
    )
  }

  removeElement(index) {
    return React.createElement(
      'div', {
        className: 'remove-array-element',
        onClick: this.destroyElement.bind(this, index)
      },
      '\u00D7'
    )
  }

  createElement() {
    let newItem
    if (this.props.schema.items.type === 'object') {
      newItem = {}
      for (const property in this.props.schema.items.properties) {
        const propertySchema = this.props.schema.items.properties[property]
        newItem[property] = propertySchema.default || null
      }
    } else {
      newItem = this.props.schema.items.default || null
    }

    return this.props.onChange.call(this, this.props.value.concat(newItem))
  }

  destroyElement(index) {
    this.props.value.splice(index, 1)

    return this.props.onChange.call(this, this.props.value)
  }
}
