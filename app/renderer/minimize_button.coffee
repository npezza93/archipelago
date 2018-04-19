{ ipcRenderer, remote } = require 'electron'
React                   = require 'react'

module.exports =
class MinimizeButton extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'minimize-button'
      onClick: (event) ->
        remote.getCurrentWindow().minimize()
      React.createElement('div')
    )
