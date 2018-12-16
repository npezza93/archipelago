import React from 'react'
import Component from '../utils/component.jsx'
import './hamburger-menu.css'

export default class HamburgerMenu extends Component {
  render() {
    return <hamburger-container>
      {this.backdrop()}
      <hamburger-menu onClick={this.handleHamburgerClick}>
        <div></div>
        <div style={{width: '11px'}}></div>
      </hamburger-menu>
    </hamburger-container>
  }

  backdrop() {
    return (
      <back-drop
        onClick={this.handleBackdropClick}
        class={this.backdropClass} />
    )
  }

  get backdropClass() {
    return ((this.state || {}).active && 'active') || ''
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
