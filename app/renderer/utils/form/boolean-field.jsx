import React from 'react'
import Component from '../component.jsx'
import './boolean-field.css'

export default class BooleanField extends Component {
  render() {
    return <switch-field id={this.props.property}>
      {this.props.label}
      <label>
        <input
          type="checkbox"
          checked={this.props.value}
          onChange={this.handleChange} />
        <span className="slider"></span>
      </label>
    </switch-field>
  }

  handleChange(event) {
    this.props.onChange.call(this, event.target.checked)
  }
}
