import React from 'react'
import {ChromePicker} from 'react-color'

export default class ColorField extends React.Component {
  constructor(props) {
    super(props)

    this.state = {active: false}
  }

  render() {
    return <div className="color-container" key={this.props.datakey}
      style={this.state.active ? {zIndex: 2} : undefined}>
      {this.backdrop()}
      {this.text()}
    </div>
  }

  backdrop() {
    const styles = {position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}

    if (this.state.active) {
      return <div style={styles} onClick={() => this.setState({active: false})}></div>
    }
  }

  text() {
    return <input-field>
      <input
        type="text"
        datakey={this.props.datakey}
        value={this.props.value}
        onClick={() => this.setState({active: true})}
        onChange={() => {}} />
      <label>{this.props.label}</label>
      <div className="input-border"></div>
      {this.picker()}
    </input-field>
  }

  picker() {
    if (this.state.active) {
      return <div className="color-picker">
        <ChromePicker
          color={this.props.value}
          onChangeComplete={this.handleChangeComplete.bind(this)} />
      </div>
    }
  }

  handleChangeComplete(color) {
    let rgba
    if (color.rgb.a === 1) {
      rgba = `rgb(${color.rgb.r},${color.rgb.g},${color.rgb.b})`
    } else {
      rgba = `rgba(${Object.values(color.rgb).join(',')})`
    }

    this.props.onChange.call(this, rgba)
  }
}
