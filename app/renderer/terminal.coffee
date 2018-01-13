React = require 'react'

module.exports =
class Terminal extends React.Component
  constructor: (props) ->
    super(props)
    @bindDataListeners()

  render: ->
    React.createElement('archipelago-terminal', ref: 'container')

  componentDidMount: ->
    xterm = @props.session.xterm

    xterm.open(@refs.container)
    xterm.setOption('theme', archipelago.config.get('theme'))
    xterm.focus()
    @props.session.bindScrollListener()

  bindDataListeners: ->
    @props.session.on 'did-focus', () =>
      @props.selectSession(@props.session.id)
      @props.changeTitle(@props.tabId, @props.session.xterm.title)

    @props.session.on 'did-change-title', () =>
      @props.changeTitle(@props.tabId, @props.session.xterm.title)

    @props.session.on 'did-exit', () =>
      @props.removeSession(@props.tabId, @props.session.id)

    @props.session.on 'data', () =>
      @props.markUnread(@props.tabId) if @props.currentTabId != @props.tabId
