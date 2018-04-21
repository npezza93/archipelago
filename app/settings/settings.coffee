React          = require 'react'
ReactDOM       = require 'react-dom'
Profiles       = require './profiles'
PropertiesPane = require './properties_pane'

TrafficLights = require '../traffic_lights'

document.addEventListener 'DOMContentLoaded', () ->
  profilesContainer = document.querySelector('.profiles-container')
  backdrop          = document.querySelector('#backdrop')

  ReactDOM.render(React.createElement(Profiles), profilesContainer)
  ReactDOM.render(
    React.createElement(PropertiesPane),
    document.querySelector('.options-container')
  )
  ReactDOM.render(
    React.createElement(TrafficLights),
    document.querySelector('#titlebar')
  )

  document.querySelector('#hamburger').addEventListener 'click', () ->
    profilesContainer.style.left = '0px'
    backdrop.classList.add('active')

  backdrop.addEventListener 'click', () ->
    profilesContainer.style.left = '-275px'
    backdrop.classList.remove('active')
