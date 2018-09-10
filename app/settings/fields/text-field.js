const {Component, createElement} = require('react')
const rmwc = require('rmwc')

module.exports =
class TextField extends Component {
  render() {
    return createElement(
      rmwc.TextField, {
        datakey: this.props.datakey,
        label: this.props.label,
        value: this.props.value,
        onChange: e => this.props.onChange.call(this, e.target.value)
      }
    )
  }
}
