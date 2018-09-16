/* global document */
/* eslint guard-for-in: "off" */

const React = require('react')
const ReactDOM = require('react-dom')

const ConfigFile = require('../configuration/config-file')
const ProfileManager = require('../configuration/profile-manager')
const App = require('./app')

global.archipelago = {}
const profileManager = new ProfileManager(new ConfigFile())
const styleProperties = {
  fontFamily: '--font-family',
  'visor.windowBackground': '--background-color',
  fontSize: '--font-size',
  'visor.padding': '--terminal-padding',
  'theme.selection': '--selection-color'
}

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
