{ ipcRenderer, remote } = require 'electron'
React                   = require 'react'

module.exports =
class Minimize extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'minimize-button'
      style:
        flexDirection: 'column'
        justifyContent: 'center'
        display: 'flex'
        height: '16px'
        width: '16px'
        right: '113px'
        top: '14px'
        position: 'fixed'
        zIndex: 4
        filter: 'invert(20%)'
        cursor: 'pointer'
      onClick: -> remote.getCurrentWindow().minimize()
      React.createElement(
        'div'
        style:
          height: '1px'
          background: '#000'
      )
    )
