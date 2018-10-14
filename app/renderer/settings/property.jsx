import {remote} from 'electron'
import React from 'react'
import allFields from './all-fields.jsx'

export default class Property extends React.Component {
  constructor(props) {
    super(props)

    this.profileManager = remote.getGlobal('profileManager')
    this.state = {value: this.profileManager.get(props.property)}
    this.props.addSubscription(
      this.profileManager.onDidChange(this.props.property, newValue => {
        if (this.state.value !== newValue) {
          this.setState({value: newValue})
        }
      })
    )
  }

  render() {
    return allFields[this.fieldType()].call(
      this,
      this.props.property,
      this.state.value,
      this.props.schema,
      newValue => {
        this.setState({value: newValue})
        this.profileManager.set(this.props.property, newValue)
      }
    )
  }

  fieldType() {
    let {type} = this.props.schema

    if (type === 'string' && this.props.schema.color) {
      type = 'color'
    }

    return type
  }
}
