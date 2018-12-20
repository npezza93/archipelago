import ipc from 'npezza93-electron-better-ipc'
import Component from '../utils/component.jsx'
import fields from '../utils/form/fields.jsx'
import fieldType from '../utils/field-type'

export default class Property extends Component {
  render() {
    return fields[fieldType(this.props.schema)].call(
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
    return {
      value: this.props.currentProfile.get(this.props.property),
      activeProfileId: this.props.activeProfileId
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeProfileId !== prevProps.activeProfileId) {
      this.setState({value: this.props.currentProfile.get(this.props.property)})
    }
  }
}
