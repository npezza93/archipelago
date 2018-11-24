import React from 'react'

export default class BooleanField extends React.Component {
  render() {
    return <switch-field id={this.props.property}>
      {this.props.label}
      <label>
        <input type="checkbox" checked={this.props.value}
          onChange={e => this.props.onChange.call(this, e.target.checked)} />
        <span className="slider"></span>
      </label>
    </switch-field>
  }
}
