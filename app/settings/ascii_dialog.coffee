asciiChart = require('./ascii')
React = require('react')

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
      asciiChart.map (row) ->
        React.createElement(
          'div'
          key: row.dec
          style:
            display: 'flex'
            flexDirection: 'row'
            justifyContent: 'space-between'
          React.createElement(
            'div'
            style:
              flex: 1
            row.dec
          )
          React.createElement(
            'div'
            style:
              flex: 1
            row.char
          )
          React.createElement(
            'div'
            style:
              flex: 2
              textTransform: 'lowercase'
            row.detail
          )
        )
    )
