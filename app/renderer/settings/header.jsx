import React from 'react'

export default class Header extends React.Component {
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
