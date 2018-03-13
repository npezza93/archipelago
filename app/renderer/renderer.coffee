{ ipcRenderer }     = require 'electron'
React               = require 'react'
ReactDOM            = require 'react-dom'
App                 = require './app'

styleProperties =
  fontFamily: '--font-family'
  windowBackground: '--background-color'
  tabColor: '--tab-color'
  tabBorderColor: '--tab-border-color'
  fontSize: '--font-size'
  padding: '--terminal-padding'
  'theme.selection': '--selection-color'

document.addEventListener 'DOMContentLoaded', () ->
  archipelago.app = ReactDOM.render(
    React.createElement(App), document.getElementById('root')
  )
  document.querySelector('#boot').classList.add('calculating')

  for selector, cssVar of styleProperties
    element = document.documentElement

    element.style.setProperty(cssVar, archipelago.config.get(selector))

ipcRenderer.on 'new-tab', () ->
  archipelago.app.addTab() unless archipelago.config.get('singleTabMode')
ipcRenderer.on 'split-horizontal', () ->
  archipelago.app.split('horizontal')
ipcRenderer.on 'split-vertical', () ->
  archipelago.app.split('vertical')
ipcRenderer.on 'fit', () ->
  archipelago.app.fitAll()

Object.entries(styleProperties).forEach (property) ->
  archipelago.config.onDidChange property[0], (newValue) ->
    document.documentElement.style.setProperty(property[1], newValue)
