const {Component, createElement} = require('react')

module.exports =
class SelectField extends Component {
  render() {
    return createElement(
      'select-field',
      {},
      createElement(
        'select',
        {onChange: e => this.props.onChange.call(this, e.target.value),
          value: this.props.value},
        this.props.options.map(option => {
          return createElement('option', {key: option.value, value: option.value}, option.label)
        })
      ),
      createElement(
        'label',
        {},
        this.props.label
      )
    )
  }
}
