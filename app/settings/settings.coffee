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

  document.querySelector('#hamburger').addEventListener 'click', () ->
    document.querySelector('.profiles-container').style.left = '0px'
    document.querySelector('#backdrop').classList.add('active')

  document.querySelector('#backdrop').addEventListener 'click', () ->
    document.querySelector('.profiles-container').style.left = '-275px'
    document.querySelector('#backdrop').classList.remove('active')
