{ ipcRenderer, remote } = require 'electron'
React                   = require 'react'

module.exports =
class Maximize extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'maximize-button'
      style:
        flexDirection: 'column'
        justifyContent: 'center'
        display: 'flex'
        height: '12px'
        width: '12px'
        right: '61px'
        top: '14px'
        position: 'fixed'
        zIndex: 4
        border: '#000 1px solid'
        filter: 'invert(20%)'
        cursor: 'pointer'
      onClick: -> remote.getCurrentWindow().maximize()
    )
