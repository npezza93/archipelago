{ ipcRenderer, remote } = require 'electron'
React                   = require 'react'

module.exports =
class MaximizeButton extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'maximize-button'
      onClick: (event) ->
        remote.getCurrentWindow().maximize()
    )
