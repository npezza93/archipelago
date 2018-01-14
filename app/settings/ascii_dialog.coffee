CSON     = require 'season'
React    = require 'react'
{ join } = require 'path'

module.exports =
class AsciiDialog extends React.Component
  constructor: (props) ->
    super(props)
    @ascii = CSON.readFileSync(join(__dirname, './ascii.json'))

  render: ->
    React.createElement(
      'dialog'
      {}
      @heading()
      @close()
      @make row for row in @ascii
    )

  heading: ->
    React.createElement('div', className: 'ascii-heading', 'ASCII Chart')

  close: ->
    React.createElement(
      'div'
      className: 'ascii-close'
      onClick: () ->
        document.querySelector('dialog').close()
      '\u00D7'
    )

  make: (row) ->
    React.createElement(
      'div'
      key: row.dec
      className: 'ascii-row'
      React.createElement('div', {}, row.dec)
      React.createElement('div', {}, row.char)
      React.createElement('div', {}, row.detail)
    )
