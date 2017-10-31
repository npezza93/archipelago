require('../utils/attr')

module.exports =
class Split
  @attr 'separator',
    get: ->
      return @_separator if @_separator

      @_separator = document.createElement('div')
      @_separator.classList.add('separator')

      @_separator.addEventListener 'mousedown', (ev) =>
        console.log(ev)

      @_separator

  @attr 'splitContainer',
    get: ->
      return @_splitContainer if @_splitContainer

      @_splitContainer = document.createElement('div')
      @_splitContainer.classList.add('terminal-container')
      @_splitContainer.classList.add(@orientation)

      @_splitContainer

    set: (splitContainer) ->
      @_splitContainer = splitContainer

  @attr 'originalTerminal',
    get: ->
      return @_originalTerminal if @_originalTerminal?

      @_originalTerminal = document.createElement('archipelago-terminal')
      @_originalTerminal.tab = @_tab
      @_originalTerminal.xterm = @_xterm
      @_originalTerminal.pty = @_pty

      @_originalTerminal

  @attr 'newTerminal',
    get: ->
      return @_newTerminal if @_newTerminal?

      @_newTerminal = document.createElement('archipelago-terminal')
      @_newTerminal.tab = @_tab

      @_newTerminal

  @attr 'focusedTerminal',
    get: ->
      return @_focusedTerminal if @_focusedTerminal?

      focusedTerminal = document.activeElement
      body = document.querySelector('body')

      while focusedTerminal != body && focusedTerminal.tagName != 'ARCHIPELAGO-TERMINAL'
        focusedTerminal = focusedTerminal.parentElement

      if focusedTerminal == body
        @_focusedTerminal = document.querySelector('archipelago-tab.active').terminals().pop()
      else
        @_focusedTerminal = focusedTerminal

      @_focusedTerminal.preserveState = true

      @_focusedTerminal

  constructor: (@orientation) ->
    @_tab = @focusedTerminal.tab
    @_xterm = @focusedTerminal.xterm
    @_pty = @focusedTerminal.pty

  split: ->
    if @existingContainer()
      @splitContainer = @focusedTerminal.parentElement
      @_splitContainer.classList.remove('vertical')
      @_splitContainer.classList.remove('horizontal')
      @_splitContainer.classList.add(@orientation)
      @focusedTerminal.preserveState = null
    else
      @wrapOriginalTerminalAndReopen()

    @splitContainer.appendChild(@separator)
    @splitContainer.appendChild(@newTerminal)
    @newTerminal.open()
    @newTerminal.bindDataListeners()
    @newTerminal.fit()
    @newTerminal.xterm.focus()
    window.dispatchEvent(new Event('resize'))

  wrapOriginalTerminalAndReopen: ->
    @splitContainer.appendChild(@originalTerminal)
    @focusedTerminal.replaceWith(@splitContainer)
    @originalTerminal.open()
    @originalTerminal.bindExit()
    console.log @originalTerminal.xterm
    setTimeout (=>
      @originalTerminal.xterm.setOption('theme', @originalTerminal.settings('theme'))
      return
    ), 10

  existingContainer: ->
    parent = @focusedTerminal.parentElement

    parent.childElementCount == 1 && parent.classList.contains('terminal-container')
