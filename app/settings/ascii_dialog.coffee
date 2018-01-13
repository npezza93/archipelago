CSON  = require 'season'
React = require 'react'

module.exports =
class AsciiDialog extends React.Component
  render: ->
    React.createElement(
      'dialog'
      {}
      React.createElement('div', className: 'ascii-heading', 'ASCII Chart')
      React.createElement(
        'div'
        className: 'ascii-close'
        onClick: () ->
          document.querySelector('dialog').close()
        '\u00D7'
      )
      CSON.readFileSync(join(__dirname, './ascii.json')).map (row) ->
        React.createElement(
          'div'
          key: row.dec
          className: 'ascii-row'
          React.createElement('div', {}, row.dec)
          React.createElement('div', {}, row.char)
          React.createElement('div', {}, row.detail)
        )
    )
