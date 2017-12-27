React    = require('react')
ReactDOM = require('react-dom')
Profiles = require('./profiles')
Options  = require('./options')

document.addEventListener 'DOMContentLoaded', () ->
  ReactDOM.render(
    React.createElement(Profiles), document.querySelector('.profiles-container')
  )
  ReactDOM.render(
    React.createElement(Options), document.querySelector('.options-container')
  )
