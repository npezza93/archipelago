import React from 'react'
import {ChromePicker} from 'react-color'
import Component from '../component.jsx'
import TextField from './text-field.jsx'
import './color-field.css'

export default class ColorField extends Component {
  render() {
    return <color-field
      key={this.props.datakey}
      style={this.state.active ? {zIndex: 2} : undefined}>
      {this.backdrop()}
      {this.text()}
    </color-field>
  }

  initialState() {
    return {active: false}
  }

  backdrop() {
    const styles = {position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}

    if (this.state.active) {
      return <div style={styles} onClick={this.deactivate}></div>
    }
  }

  text() {
    return <TextField
      key={this.props.datakey}
      property={this.props.datakey}
      value={this.props.value || ''}
      label={this.props.label}
      onChange={() => {}}
      onClick={this.activate}>
      {this.picker()}
    </TextField>
  }

  picker() {
    if (this.state.active) {
      return <div className="color-picker">
        <ChromePicker
          color={this.props.value}
          onChangeComplete={this.handleChangeComplete} />
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

  activate() {
    this.setState({active: true})
  }

  deactivate() {
    this.setState({active: false})
  }
}
