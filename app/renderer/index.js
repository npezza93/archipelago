/* global document */
/* eslint guard-for-in: "off" */

const React = require('react')
const ReactDOM = require('react-dom')

const {pref} = require('../common/config-file')
const ProfileManager = require('../common/profile-manager')
const App = require('./app')

global.archipelago = {}
const profileManager = new ProfileManager(pref())
const styleProperties = {
  fontFamily: '--font-family',
  windowBackground: '--background-color',
  tabColor: '--tab-color',
  tabBorderColor: '--tab-border-color',
  fontSize: '--font-size',
  padding: '--terminal-padding',
  'theme.selection': '--selection-color'
}

global.archipelago.app = ReactDOM.render(
  React.createElement(App, {profileManager, pref}), document.getElementById('root')
)

for (const selector in styleProperties) {
  const cssVar = styleProperties[selector]
  const element = document.documentElement

  element.style.setProperty(cssVar, profileManager.get(selector))
}

Object.entries(styleProperties).forEach(property =>
  profileManager.onDidChange(property[0], newValue => document.documentElement.style.setProperty(property[1], newValue))
)
