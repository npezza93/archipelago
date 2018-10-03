const React = require('react');
const {
  CompositeDisposable,
} = require('event-kit');

const Profile = require('./profile');

module.exports = class Profiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeProfile: this.props.profileManager.activeProfile(),
      profiles: this.props.profileManager.all(),
    };

    this.subscriptions = new CompositeDisposable();
    this.bindListener();
  }

  render() {
    return React.createElement(
      'archipelago-profiles', {},
      this.header(),
      this.list(),
      this.newProfile(),
    );
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  header() {
    return React.createElement('div', {
      className: 'profile-header',
    }, 'Profiles');
  }

  list() {
    return React.createElement(
      'div', {
        className: 'profile-list',
      },
      this.state.profiles.map(profile => React.createElement(
        Profile, {
          profile,
          profileManager: this.props.profileManager,
          key: profile.id,
          activeProfile: this.state.activeProfile,
          removeProfile: this.removeProfile.bind(this),
          setActiveProfile: this.setActiveProfile.bind(this),
        },
      )),
    );
  }

  newProfile() {
    return React.createElement(
      'div', {
        className: 'new-profile',
        onClick: () => {
          const profile = this.props.profileManager.create();

          this.setState({
            activeProfile: profile,
            profiles: this.props.profileManager.all(),
          });
        },
      },
      'Add New Profile',
    );
  }

  removeProfile(profile) {
    const {
      profileManager,
    } = this.props;

    if (profileManager.activeProfile().id === profile.id) {
      const newActiveProfileId = profileManager.profileIds.find(profileId => profileId !== profile.id);
      profileManager.resetActiveProfile(newActiveProfileId);
    }

    profile.destroy();
  }

  setActiveProfile(activeProfile) {
    this.setState({
      activeProfile,
    });

    this.props.profileManager.activeProfileId = activeProfile.id;
  }

  bindListener() {
    this.subscriptions.add(
      this.props.profileManager.onActiveProfileChange((activeProfile) => {
        this.setState({
          activeProfile,
        });
      }),
    );

    this.subscriptions.add(
      this.props.profileManager.onProfileChange(() => {
        this.setState({
          profiles: this.props.profileManager.all(),
        });
      }),
    );
  }
};
