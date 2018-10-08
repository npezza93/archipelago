import React from 'react'
import titleize from 'titleize'

export default class Header extends React.Component {
  render() {
    return <archipelago-header>
      {Object.keys(this.props.headings).map(heading => (
        <div key={heading} position={this.props.headings[heading]}>
          {titleize(heading)}
        </div>
      ))}
    </archipelago-header>
  }
}
