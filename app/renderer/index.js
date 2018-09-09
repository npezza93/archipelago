/* global document */
/* eslint guard-for-in: "off" */

const ConfigFile = require('../configuration/config-file')
const ProfileManager = require('../configuration/profile-manager')

const profileManager = new ProfileManager(new ConfigFile())

const styleProperties = {
  fontFamily: '--font-family',
  windowBackground: '--background-color',
  tabColor: '--tab-color',
  tabBorderColor: '--tab-border-color',
  fontSize: '--font-size',
  padding: '--terminal-padding',
  'theme.selection': '--selection-color'
}

document.addEventListener('DOMContentLoaded', () => {
  const React = require('react')
  const ReactDOM = require('react-dom')
  const App = require('./app')

  global.archipelago = {}
  global.archipelago.app = ReactDOM.render(
    React.createElement(App, {profileManager}), document.getElementById('root')
  )

  for (const selector in styleProperties) {
    const cssVar = styleProperties[selector]
    const element = document.documentElement

    element.style.setProperty(cssVar, profileManager.get(selector))
  }

  Object.entries(styleProperties).forEach(property =>
    profileManager.onDidChange(property[0], newValue => document.documentElement.style.setProperty(property[1], newValue))
  )
})
