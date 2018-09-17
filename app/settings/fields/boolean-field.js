const {Component, createElement} = require('react')

module.exports =
class BooleanField extends Component {
  render() {
    return createElement(
      'switch-field',
      {},
      this.props.label,
      createElement('label', {},
        createElement('input', {
          type: 'checkbox', checked: this.props.value,
          onChange: e => this.props.onChange.call(this, e.target.checked)
        }),
        createElement('span', {className: 'slider'})
      )
    )
  }
}
