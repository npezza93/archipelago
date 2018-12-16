import React from 'react'
import Component from '../component.jsx'
import './select-field.css'

export default class SelectField extends Component {
  render() {
    return <select-field>
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="7 10 10 5">
        <path fill="#0" fillRule="evenodd" opacity=".54" d="M7 10l5 5 5-5z"/>
      </svg>
      <select
        onChange={this.handleChange}
        id={this.props.property}
        value={this.props.value || ''}>
        {this.props.options.map(option =>
          <option key={option} value={option}>{option}</option>
        )}
      </select>
      <label htmlFor={this.props.property}>{this.props.label}</label>
    </select-field>
  }

  handleChange(event) {
    this.props.onChange.call(this, event.target.value)
  }
}
