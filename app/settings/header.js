const {Component, createElement} = require('react')

module.exports =
class Header extends Component {
  render() {
    return createElement(
      'archipelago-header',
      {},
      Object.keys(this.props.headings).map(heading => {
        return this.renderHeading(heading)
      })
    )
  }

  renderHeading(heading) {
    const headingPosition = this.props.headings[heading]

    return createElement(
      'div', {
        key: heading,
        position: headingPosition
      },
      heading.titleize
    )
  }
}
