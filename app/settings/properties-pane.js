const {Component, createElement} = require('react')

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
      this.headings.map(scope => {
        return createElement(
          PropertiesSection,
          {
            scope,
            key: scope,
            properties: Object.assign(...this.scopes[scope]),
            onObserved: this.onObserved.bind(this)
          }
        )
      })
    )
  }

  onObserved(inView, scope) {
    if (inView) {
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

      this.setState({headings: headerState})
    }
  }
}
