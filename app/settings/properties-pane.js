const {Component, createElement} = require('react')
const Waypoint = require('react-waypoint')
const Schema = require('../configuration/schema')
const Header = require('./header')
const PropertiesSection = require('./properties-section')

module.exports =
class PropertiesPane extends Component {
  constructor(props) {
    super(props)
    this.scopes = (new Schema()).propertiesGroupedBySetting()

    this.headings = Object.keys(this.scopes).filter(header => header !== 'profile')

    this.state = {
      headings: this.headings.reduce((headingState, heading) => {
        headingState[this.headings.indexOf(heading)] = heading
        return headingState
      }, {})
    }
  }

  render() {
    return createElement(
      'archipelago-properties-pane',
      {},
      createElement(Header, {headings: this.state.headings}),
      this.headings.map(heading => this.withWaypoint(heading))
    )
  }

  withWaypoint(scope) {
    return createElement(
      Waypoint, {
        key: scope,
        topOffset: '20px',
        bottomOffset: '20px',
        onPositionChange: waypoint => {
          if (waypoint.currentPosition !== 'inside') {
            return
          }

          const enteringIndex = this.headings.indexOf(scope)
          const headerState = {}
          for (let index = 0; index < this.headings.length; index++) {
            const heading = this.headings[index]
            if (index === enteringIndex) {
              headerState[heading] = 0
            } else {
              let position = index - enteringIndex
              if (position > 1) {
                position = 1
              }
              if (position < -2) {
                position = -2
              }
              headerState[heading] = position
            }
          }

          return this.setState({headings: headerState})
        }
      },
      createElement(
        PropertiesSection, {properties: Object.assign(...this.scopes[scope])}
      )
    )
  }
}
