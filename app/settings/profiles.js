const React = require('react')
const {CompositeDisposable} = require('event-kit')

const Profile = require('./profile')

module.exports =
class Profiles extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeProfileId: this.props.profileManager.activeProfileId,
      profiles: this.props.profileManager.all()
    }

    this.subscriptions = new CompositeDisposable()
    this.bindListener()
  }

  render() {
    return React.createElement(
      'archipelago-profiles',
      {},
      this.header(),
      this.list(),
      this.newProfile()
    )
  }

  componentWillUnmount() {
    this.subscriptions.dispose()
  }

  header() {
    return React.createElement('div', {className: 'profile-header'}, 'Profiles')
  }

  list() {
    return React.createElement(
      'div',
      {className: 'profile-list'},
      this.state.profiles.map(profile =>
        React.createElement(
          Profile, {
            profile,
            profileManager: this.props.profileManager,
            key: profile.id,
            activeProfileId: this.state.activeProfileId,
            removeProfile: this.removeProfile.bind(this),
            setActiveProfileId: this.setActiveProfileId.bind(this)
          }
        )
      )
    )
  }

  newProfile() {
    return React.createElement(
      'div', {
        className: 'new-profile',
        onClick: () => {
          const profile = this.props.profileManager.create()

          this.setState({
            activeProfileId: profile.id,
            profiles: this.props.profileManager.all()
          })
        }
      },
      'Add New Profile'
    )
  }

  removeProfile(id) {
    const profile = this.props.profileManager.find(id)
    profile.destroy()

    this.props.profileManager.validate()
  }

  setActiveProfileId(activeProfileId) {
    this.setState({activeProfileId})

    this.props.profileManager.activeProfileId = activeProfileId
  }

  bindListener() {
    this.subscriptions.add(
      this.props.profileManager.onActiveProfileChange(activeProfileId => {
        this.setState({activeProfileId})
      })
    )

    this.subscriptions.add(
      this.props.profileManager.onProfileChange(() => {
        this.setState({profiles: this.props.profileManager.all()})
      })
    )
  }
}
