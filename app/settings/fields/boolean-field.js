const {Component, createElement} = require('react')
const {Switch} = require('rmwc')

module.exports =
class BooleanField extends Component {
  render() {
    return createElement(
      Switch, {
        datakey: this.props.datakey,
        label: this.props.label,
        checked: this.props.value,
        onChange: e => this.props.onChange.call(this, e.target.checked)
      }
    )
  }
}
