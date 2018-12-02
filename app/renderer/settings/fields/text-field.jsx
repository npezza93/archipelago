import React from 'react'

export default class TextField extends React.Component {
  render() {
    return <input-field>
      <input type="text" id={this.props.property}
        value={this.props.value || ''}
        onChange={e => this.props.onChange.call(this, e.target.value)} />
      <label>{this.props.label}</label>
      <div className="input-border"></div>
    </input-field>
  }
}
