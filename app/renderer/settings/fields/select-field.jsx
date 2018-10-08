import React from 'react'

export default class SelectField extends React.Component {
  render() {
    return <select-field>
      <select onChange={e => this.props.onChange.call(this, e.target.value)}
        value={this.props.value}>
        {this.props.options.map(option =>
          <option key={option} value={option}>{option}</option>
        )}
      </select>
      <label>{this.props.label}</label>
    </select-field>
  }
}
