import React from 'react'
import formatAccelerator from '../format-accelerator'
import Component from '../component.jsx'
import KeybindingCapturer from '../keybinding-capturer.jsx'
import TextField from './text-field.jsx'

export default class KeybindingField extends Component {
  render() {
    return <keybinding-field
      key={this.props.property}
      style={this.state.active ? {zIndex: 2} : undefined}>
      {this.backdrop()}
      {this.text()}
    </keybinding-field>
  }

  initialState() {
    return {active: false, value: this.props.value}
  }

  backdrop() {
    const styles = {position: 'fixed', top: 0, left: 0, right: 0, bottom: 0}

    if (this.state.active) {
      return <div style={styles} onClick={this.deactivate}></div>
    }
  }

  text() {
    return <TextField
      key={this.props.property}
      property={this.props.property}
      value={formatAccelerator(this.state.value) || ''}
      label={this.props.label}
      onChange={() => {}}
      readOnly={true}
      onClick={this.activate}>
      {this.capturer()}
    </TextField>
  }

  capturer() {
    if (this.state.active) {
      return <KeybindingCapturer
        deactivate={this.deactivate}
        currentKeybinding={this.state.value}
        captureKeybinding={this.captureKeybinding} />
    }
  }

  activate() {
    this.setState({active: true})
  }

  deactivate() {
    this.setState({active: false})
  }

  captureKeybinding(value) {
    this.setState({value})
    this.props.onChange.call(this, value)
  }
}
