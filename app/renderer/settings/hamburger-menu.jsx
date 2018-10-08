import React from 'react'

export default class HamburgerMenu extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return <div>
      {this.backdrop()}
      <div id="hamburger" onClick={this.handleHamburgerClick.bind(this)}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  }

  backdrop() {
    return (
      <div id="backdrop" onClick={this.handleBackdropClick.bind(this)} className={this.backdropClass}>
      </div>
    )
  }

  get backdropClass() {
    return (this.state.active && 'active') || ''
  }

  handleHamburgerClick() {
    this.props.toggleProfilesDrawer(true)
    this.setState({active: true})
  }

  handleBackdropClick() {
    this.props.toggleProfilesDrawer(false)
    this.setState({active: false})
  }
}
