import React from 'react'
import Component from '../utils/component.jsx'

export default class Header extends Component {
  render() {
    return <archipelago-header>
      {this.headings.map(heading => (
        <div key={heading} className={this.className(heading)}>
          {heading}
        </div>
      ))}
    </archipelago-header>
  }

  initialize() {
    this.headings = [...this.props.headings].reverse()
  }

  className(heading) {
    if (heading === this.props.root) {
      return 'root'
    }
  }
}
