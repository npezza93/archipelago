React      = require 'react'
{ Switch } = require 'rmwc'

module.exports =
class BooleanField extends React.Component
  render: ->
    React.createElement(
      Switch
      datakey: @props.datakey
      label: @props.label
      checked: @props.value
      onChange: (e) => @props.onChange.call(this, e.target.checked)
    )
