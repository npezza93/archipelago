const React = require('react');
const {
  CompositeDisposable,
} = require('event-kit');

const ProfileManager = require('../configuration/profile-manager');
const {
  pref,
} = require('../configuration/config-file');
const allFields = require('./all-fields');

module.exports = class Property extends React.Component {
  constructor(props) {
    super(props);

    this.pref = pref();
    this.profileManager = new ProfileManager(this.pref);
    this.subscriptions = new CompositeDisposable();

    this.state = {
      [props.property]: this.profileManager.get(props.property),
    };

    this.bindListener();
  }

  render() {
    return allFields[this.fieldType()].call(
      this,
      this.props.property,
      this.state[this.props.property],
      this.props.schema,
      newValue => this.profileManager.set(this.props.property, newValue),
    );
  }

  fieldType() {
    let {
      type,
    } = this.props.schema;

    if (type === 'string' && this.props.schema.color) {
      type = 'color';
    }

    return type;
  }

  componentWillUnmount() {
    this.pref.dispose();
    this.subscriptions.dispose();
  }

  bindListener() {
    this.subscriptions.add(
      this.profileManager.onDidChange(this.props.property, (newValue) => {
        if (this.state[this.props.property] !== newValue) {
          return this.setState({
            [this.props.property]: newValue,
          });
        }
      }),
    );
  }
};
