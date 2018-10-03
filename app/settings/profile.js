const React = require('react');
const {
  CompositeDisposable,
} = require('event-kit');

module.exports = class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editMode: false,
      name: this.props.profile.name,
    };

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      this.props.profile.onDidChange('name', name => this.setState({
        name,
      })),
    );
  }


  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  textOrInput() {
    if (this.state.editMode) {
      return this.input();
    }
    return this.state.name;
  }

  input() {
    return React.createElement(
      'input', {
        autoFocus: true,
        type: 'text',
        value: this.state.name,
        onFocus: e => e.target.select(),
        onBlur: () => this.setState({
          editMode: false,
        }),
        onChange: (e) => {
          const name = e.target.value;

          this.props.profile.name = name;

          this.setState({
            name,
          });
        },
      },
    );
  }

  removeProfile() {
    if (this.props.profileManager.profileIds.length <= 1) {
      return;
    }

    return React.createElement(
      'span', {
        className: 'profile-remove',
        onClick: (e) => {
          e.stopPropagation();
          this.props.removeProfile(this.props.profile);
        },
      },
      '\u00D7',
    );
  }

  render() {
    return React.createElement(
      'archipelago-profile', {
        class: this.props.activeProfile.id === this.props.profile.id ? 'active' : undefined,
        onDoubleClick: () => this.setState({
          editMode: true,
        }),
        onClick: () => this.props.setActiveProfile(this.props.profile),
      },
      this.textOrInput(),
      this.removeProfile(),
    );
  }
};
