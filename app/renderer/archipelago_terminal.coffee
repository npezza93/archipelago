React = require('react')

module.exports =
class ArchipelagoTerminal extends React.Component
  constructor: (props) ->
    super(props)
    @bindDataListeners()

  render: ->
    React.createElement('archipelago-terminal', { ref: "container" })

  componentDidMount: ->
    @props.terminal.xterm.open(@refs.container, true)
    @props.terminal.setBellStyle()
    @props.terminal.updateSettings()
    @props.terminal.xterm.focus()
    @props.terminal.xterm.element.addEventListener 'wheel', () =>
      clearTimeout(@scrollbarFade);
      @scrollbarFade = setTimeout(
        () => @props.terminal.xterm.element.classList.remove('scrolling'),
        600
      )
      @props.terminal.xterm.element.classList.add('scrolling')

  bindDataListeners: ->
    @props.terminal.on 'focused', () =>
      @props.selectTerminal(@props.terminal.id)
      @props.changeTitle(@props.tabId, @props.terminal.xterm.title)

    @props.terminal.on 'titleChanged', () =>
      @props.changeTitle(@props.tabId, @props.terminal.xterm.title)

    @props.terminal.on 'exit', () =>
      @props.removeTerminal(@props.tabId, @props.terminal.id)

    @props.terminal.on 'data', () =>
      if @props.currentTab != @props.tabId
        @props.markUnread(@props.tabId)
