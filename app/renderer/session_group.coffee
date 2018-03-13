React     = require 'react'
SplitPane = require 'react-split-pane'

module.exports =
class SessionGroup
  isSession: false

  constructor: (group, orientation) ->
    @group       = group
    @orientation = orientation

  render: (props) ->
    React.createElement(
      SplitPane
      split: @orientation
      defaultSize: '50%'
      @left.render(props)
      @right.render(props)
    )

  kill: ->
    @left.kill()
    @right.kill()

  fit: ->
    @left.fit()
    @right.fit()
