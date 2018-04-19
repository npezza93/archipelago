{ ipcRenderer, remote } = require 'electron'
React                   = require 'react'

module.exports =
class CloseButton extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'close-button'
      onClick: (event) ->
        remote.getCurrentWindow().close()
      React.createElement('div')
      React.createElement('div')
    )
