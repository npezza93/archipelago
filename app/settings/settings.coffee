React    = require('react')
ReactDOM = require('react-dom')
Profiles = require('./profiles')
Options  = require('./options')

document.addEventListener 'DOMContentLoaded', () =>
  ReactDOM.render(
    React.createElement(Profiles), document.querySelector('.profiles-container')
  )
  ReactDOM.render(
    React.createElement(Options), document.querySelector('.options-container')
  )

  # jsColorPicker '#theme input[type="text"]',
  #   customBG: '#fff'
  #   init: (elm, colors) ->
  #     elm.style.backgroundColor = elm.value
  #     elm.style.color = if colors.rgbaMixCustom.luminance > 0.22 then '#222' else '#ddd'
  #     return
  #   actionCallback: (e, action) ->
  #     if action == 'changeXYValue' or action == 'changeOpacityValue'
  #       @input.dispatchEvent new Event('change', bubbles: true)
  #     return
