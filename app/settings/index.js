/* global document, window */

const ipc = require('electron-better-ipc')
const React = require('react')
const ReactDOM = require('react-dom')

const ProfileManager = require('../configuration/profile-manager')
const {pref} = require('../configuration/config-file')

const TrafficLights = require('../traffic-lights/all')
const PropertiesPane = require('./properties-pane')

const Profiles = require('./profiles')

const profilesContainer = document.querySelector('.profiles-container')
const backdrop = document.querySelector('#backdrop')

ReactDOM.render(
  React.createElement(PropertiesPane, {profileManager: (new ProfileManager(pref()))}),
  document.querySelector('.options-container')
)
ReactDOM.render(React.createElement(Profiles, {profileManager: (new ProfileManager(pref()))}), profilesContainer)
ReactDOM.render(
  React.createElement(TrafficLights),
  document.querySelector('#titlebar')
)

document.querySelector('#hamburger').addEventListener('click', () => {
  profilesContainer.style.left = '0px'
  return backdrop.classList.add('active')
})

backdrop.addEventListener('click', () => {
  profilesContainer.style.left = '-275px'
  return backdrop.classList.remove('active')
})

ipc.answerMain('close-current-tab', () => window.close())
