import React from 'react'
import Component from '../component.jsx'
import './text-field.css'

export default class TextField extends Component {
  render() {
    return <input-field>
      <input
        type="text"
        autoFocus={this.props.autoFocus}
        readOnly={this.props.readOnly}
        id={this.props.property}
        value={this.props.value || ''}
        onChange={this.handleChange}
        onKeyPress={this.props.onKeyPress}
        onClick={this.props.onClick} />
      <label htmlFor={this.props.property}>
        {this.props.label}
      </label>
      <div className="input-border"></div>
      {this.props.children}
    </input-field>
  }

  handleChange(event) {
    this.props.onChange.call(this, event.target.value)
  }
}
