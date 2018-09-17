const {Component, createElement} = require('react')

module.exports =
class TextField extends Component {
  render() {
    return createElement(
      'input-field',
      {},
      createElement(
        'input', {
          type: 'text',
          datakey: this.props.datakey,
          value: this.props.value,
          onChange: e => this.props.onChange.call(this, e.target.value)
        }
      ),
      createElement('label', {}, this.props.label),
      createElement('div', {className: 'input-border'})
    )
  }
}
