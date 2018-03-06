React            = require 'react'
{ TextField }    = require 'rmwc'
{ ChromePicker } = require 'react-color'

module.exports =
class ColorField extends React.Component
  constructor: (props) ->
    super(props)
    @state = active: false

  render: ->
    React.createElement(
      'div'
      className: 'color-container'
      key: @props.datakey
      style: if @state.active then zIndex: 2
      @backdrop()
      @text()
    )

  backdrop: ->
    return unless @state.active

    React.createElement(
      'div'
      style:
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0
      onClick: => @setState(active: false)
    )

  text: ->
    React.createElement(
      TextField
      datakey: @props.datakey
      label: @props.label
      value: @props.value
      onClick: => @setState(active: true)
      onChange: ->
      @picker()
    )

  picker: ->
    return unless @state.active

    React.createElement(
      'div'
      className: 'color-picker'
      React.createElement(
        ChromePicker
        color: @props.value
        onChangeComplete: (color) =>
          if color.rgb.a == 1
            rgba = "rgb(#{color.rgb.r},#{color.rgb.g},#{color.rgb.b})"
          else
            rgba = "rgba(#{Object.values(color.rgb).join(",")})"

          @props.onChange.call(this, rgba)
      )
    )
