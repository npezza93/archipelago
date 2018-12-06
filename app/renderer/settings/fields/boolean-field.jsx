import React from 'react'
import Component from '../../utils/component.jsx'

export default class BooleanField extends Component {
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
