{ ipcRenderer, remote } = require 'electron'
React                   = require 'react'

module.exports =
class Close extends React.Component
  render: ->
    return null if process.platform is 'darwin'

    React.createElement(
      'close-button'
      style:
        '-webkit-app-region': 'no-drag'
        height: '16px'
        width: '16px'
        right: '13px'
        top: '14px'
        position: 'fixed'
        zIndex: 4
        filter: 'invert(20%)'
        cursor: 'pointer'
      onClick: -> remote.getCurrentWindow().close()
      React.createElement(
        'div'
        style:
          height: '1px'
          position: 'absolute'
          width: '20px'
          top: '7px'
          left: '-2px'
          background: '#000'
          transform: 'rotate(45deg)'
      )
      React.createElement(
        'div'
        style:
          height: '1px'
          position: 'absolute'
          width: '20px'
          top: '7px'
          left: '-2px'
          background: '#000'
          transform: 'rotate(135deg)'
      )
    )
