import ipc from 'electron-better-ipc'
import React from 'react'
import allFields from './all-fields.jsx'

export default class Property extends React.Component {
  constructor(props) {
    super(props)

    this.state = {value: this.props.currentProfile.get(props.property)}
  }

  render() {
    return allFields[this.fieldType()].call(
      this,
      this.props.property,
      this.state.value,
      this.props.schema,
      newValue => {
        this.setState({value: newValue})
        ipc.callMain('change-setting', {property: this.props.property, value: newValue})
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
