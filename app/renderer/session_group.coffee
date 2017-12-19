React     = require('react')
SplitPane = require('react-split-pane')

module.exports =
class SessionGroup
  constructor: (group, orientation) ->
    @group       = group
    @orientation = orientation

  isSession: ->
    false

  render: (props) ->
    React.createElement(
      SplitPane, {
        split: @orientation,
        defaultSize: '50%'
      }, @left.render(props), @right.render(props)
    )

  kill: ->
    @left.kill()
    @right.kill()
