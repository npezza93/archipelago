const {Component, createElement} = require('react')
const {ChromePicker} = require('react-color')

module.exports =
class ColorField extends Component {
  constructor(props) {
    super(props)

    this.state = {active: false}
  }

  render() {
    return createElement(
      'div', {
        className: 'color-container',
        key: this.props.datakey,
        style: this.state.active ? {zIndex: 2} : undefined
      },
      this.backdrop(),
      this.text()
    )
  }

  backdrop() {
    if (this.state.active) {
      return createElement(
        'div', {
          style: {position: 'fixed', top: 0, left: 0, right: 0, bottom: 0},
          onClick: () => this.setState({active: false})
        }
      )
    }
  }

  text() {
    return createElement(
      'input-field',
      {},
      createElement(
        'input', {
          type: 'text',
          datakey: this.props.datakey,
          value: this.props.value,
          onClick: () => this.setState({active: true}),
          onChange: () => {}
        }
      ),
      createElement('label', {}, this.props.label),
      createElement('div', {className: 'input-border'}),
      this.picker()
    )
  }

  picker() {
    if (this.state.active) {
      return createElement(
        'div',
        {className: 'color-picker'},
        createElement(
          ChromePicker, {
            color: this.props.value,
            onChangeComplete: color => {
              let rgba
              if (color.rgb.a === 1) {
                rgba = `rgb(${color.rgb.r},${color.rgb.g},${color.rgb.b})`
              } else {
                rgba = `rgba(${Object.values(color.rgb).join(',')})`
              }

              this.props.onChange.call(this, rgba)
            }
          }
        )
      )
    }
  }
}
