import React from 'react'
import autoBind from 'auto-bind'

export default class HamburgerMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {}
    autoBind(this)
  }

  render() {
    return <div>
      {this.backdrop()}
      <div id="hamburger" onClick={this.handleHamburgerClick}>
        <div></div>
        <div style={{width: '11px'}}></div>
      </div>
    </div>
  }

  backdrop() {
    return (
      <div id="backdrop" onClick={this.handleBackdropClick} className={this.backdropClass}>
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
