import ipc from 'electron-better-ipc'
import Component from '../utils/component.jsx'
import allFields from './all-fields.jsx'

export default class Property extends Component {
  render() {
    return allFields[this.fieldType()].call(
      this,
      this.props.property,
      this.state.value,
      this.props.schema,
      newValue => {
        this.setState({value: newValue})
        ipc.callMain('change-setting', {property: this.props.property, value: newValue})
      }
    )
  }

  initialState() {
    return {value: this.props.currentProfile.get(this.props.property)}
  }

  fieldType() {
    let {type} = this.props.schema

    if (type === 'string' && this.props.schema.color) {
      type = 'color'
    }

    return type
  }
}
