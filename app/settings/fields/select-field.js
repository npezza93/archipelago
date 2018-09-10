const {Component, createElement} = require('react')
const {Select} = require('rmwc')

module.exports =
class SelectField extends Component {
  render() {
    return createElement(
      Select, {
        datakey: this.props.datakey,
        label: this.props.label,
        value: this.props.value,
        options: this.props.options,
        onChange: e => this.props.onChange.call(this, e.target.value)
      }
    )
  }
}
