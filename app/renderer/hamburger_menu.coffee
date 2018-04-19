{ ipcRenderer } = require 'electron'
React           = require 'react'

module.exports =
class HamburgerMenu extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'hamburger-menu'
      onClick: (event) ->
        { right: right, bottom: bottom } =
          event.currentTarget.getBoundingClientRect()
        ipcRenderer.send('open-hamburger-menu', { x: right, y: bottom })
      React.createElement('div')
      React.createElement('div')
      React.createElement('div')
    )
