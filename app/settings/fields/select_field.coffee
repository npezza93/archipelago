React      = require 'react'
{ Select } = require 'rmwc'

module.exports =
class SelectField extends React.Component
  render: ->
    React.createElement(
      Select
      datakey: @props.datakey
      label: @props.label
      value: @props.value
      options: @props.options
      onChange: (e) => @props.onChange.call(this, e.target.value)
    )
