import React from 'react'
import Octicon, {X} from '@githubprimer/octicons-react'
import Component from '../component.jsx'
import fieldType from '../field-type'
import * as coreFields from './core-fields.jsx'
import './array-field.css'

export default class ArrayField extends Component {
  render() {
    return <array-field>
      {this.props.value.map((element, i) => this.renderElement(element, i))}
      {this.addElement()}
    </array-field>
  }

  renderElement(element, index) {
    return <array-element key={index}>
      {this.renderItems(element, index)}
      {this.removeElement(index)}
    </array-element>
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
    return coreFields[fieldType(schema)].call(
      this,
      property,
      value,
      schema,
      newValue => {
        this.props.value[index][property] = newValue
        this.props.onChange.call(this, this.props.value)
      }
    )
  }

  addElement() {
    return <create-element onClick={this.createElement} key="create-array-el">
      add new {this.props.property.slice(0, -1)}
    </create-element>
  }

  removeElement(index) {
    return <remove-element onClick={this.destroyElement.bind(this, index)}>
      <Octicon icon={X} />
    </remove-element>
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
