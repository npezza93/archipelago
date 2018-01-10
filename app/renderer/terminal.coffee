React = require 'react'

module.exports =
class Terminal extends React.Component
  constructor: (props) ->
    super(props)
    @bindDataListeners()

  render: ->
    React.createElement('archipelago-terminal', ref: 'container')

  componentDidMount: ->
    @props.session.xterm.open(@refs.container)
    @props.session.updateSettings()
    @props.session.xterm.focus()
    @props.session.xterm.element.addEventListener 'wheel', () =>
      clearTimeout(@scrollbarFade)
      @scrollbarFade = setTimeout(
        () => @props.session.xterm.element.classList.remove('scrolling'),
        600
      )
      @props.session.xterm.element.classList.add('scrolling')

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
