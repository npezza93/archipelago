const React = require('react')
const {CompositeDisposable} = require('event-kit')

const ProfileManager = require('../configuration/profile-manager')
const ConfigFile = require('../configuration/config-file')
const allFields = require('./all-fields')

module.exports =
class Property extends React.Component {
  constructor(props) {
    super(props)

    this.profileManager = new ProfileManager(new ConfigFile())
    this.subscriptions = new CompositeDisposable()

    this.state = {
      [props.property]: this.profileManager.get(props.property, {keepEscaped: true})
    }

    this.bindListener()
  }

  render() {
    return allFields[this.props.schema.type].call(
      this,
      this.props.property,
      this.state[this.props.property],
      this.props.schema,
      newValue => this.profileManager.set(this.props.property, newValue)
    )
  }

  componentWillUnmount() {
    this.subscriptions.dispose()
  }

  bindListener() {
    this.subscriptions.add(
      this.profileManager.onDidChange(this.props.property, newValue => {
        if (this.state[this.props.property] !== newValue) {
          return this.setState({[this.props.property]: newValue})
        }
      })
    )
  }
}
