React    = require 'react'
ReactDOM = require 'react-dom'
Profiles = require './profiles'
Options  = require './options'

document.addEventListener 'DOMContentLoaded', () ->
  profilesContainer = document.querySelector('.profiles-container')
  backdrop          = document.querySelector('#backdrop')

  ReactDOM.render(React.createElement(Profiles), profilesContainer)
  ReactDOM.render(
    React.createElement(Options), document.querySelector('.options-container')
  )

  document.querySelector('#hamburger').addEventListener 'click', () ->
    profilesContainer.style.left = '0px'
    backdrop.classList.add('active')

  backdrop.addEventListener 'click', () ->
    profilesContainer.style.left = '-275px'
    backdrop.classList.remove('active')
