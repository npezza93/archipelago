React                   = require 'react'
{ CompositeDisposable } = require 'event-kit'

module.exports =
class Terminal extends React.Component
  constructor: (props) ->
    super(props)
    @subscriptions = new CompositeDisposable
    @bindDataListeners()

  render: ->
    React.createElement('archipelago-terminal', ref: 'container')

  componentDidMount: ->
    xterm = @props.session.xterm

    xterm.open(@refs.container)
    xterm.setOption('theme', archipelago.config.get('theme'))
    xterm.focus()
    @props.session.bindScrollListener()

  componentWillUnmount: ->
    @subscriptions.dispose()

  bindDataListeners: ->
    @subscriptions.add @props.session.onDidFocus () =>
      @props.selectSession(@props.session.id)
      @props.changeTitle(@props.tabId, @props.session.xterm.title)

    @subscriptions.add @props.session.onDidChangeTitle () =>
      @props.changeTitle(@props.tabId, @props.session.xterm.title)

    @subscriptions.add @props.session.onDidExit () =>
      @props.removeSession(@props.tabId, @props.session.id)

    @subscriptions.add @props.session.onData () =>
      @props.markUnread(@props.tabId) if @props.currentTabId != @props.tabId
