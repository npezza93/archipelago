React = require 'react'
rmwc  = require 'rmwc'

module.exports =
class TextField extends React.Component
  render: ->
    React.createElement(
      rmwc.TextField
      datakey: @props.datakey
      label: @props.label
      value: @props.value
      onChange: (e) => @props.onChange.call(this, e.target.value)
    )
