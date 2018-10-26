import React from 'react'

export default class SelectField extends React.Component {
  render() {
    return <select-field>
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="7 10 10 5">
        <path fill="#0" fillRule="evenodd" opacity=".54" d="M7 10l5 5 5-5z"/>
      </svg>
      <select onChange={e => this.props.onChange.call(this, e.target.value)}
        value={this.props.value || ''}>
        {this.props.options.map(option =>
          <option key={option} value={option}>{option}</option>
        )}
      </select>
      <label>{this.props.label}</label>
    </select-field>
  }
}
