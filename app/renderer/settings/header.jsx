import React from 'react'
import Component from '../utils/component.jsx'

export default class Header extends Component {
  render() {
    return <archipelago-header>
      {Object.keys(this.props.headings).map(heading => (
        <div key={heading} position={this.props.headings[heading]}>
          {heading}
        </div>
      ))}
    </archipelago-header>
  }
}
