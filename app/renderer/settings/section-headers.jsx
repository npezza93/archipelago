import React from 'react'
import Component from '../utils/component.jsx'
import './section-headers.css'

export default class SectionHeaders extends Component {
  render() {
    return <section-headers>
      {this.headings.map(heading => (
        <div key={heading} className={this.className(heading)}>
          {heading}
        </div>
      ))}
    </section-headers>
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
