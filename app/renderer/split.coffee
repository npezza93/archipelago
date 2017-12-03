require('../utils/attr')
Splitjs = require('split.js')

module.exports =
class Split
  @attr 'splitContainer',
    get: ->
      return @_splitContainer if @_splitContainer

      @_splitContainer = document.createElement('div')
      @_splitContainer.classList.add('terminal-container')
      @_splitContainer.classList.add(@orientation)

      @_splitContainer

    set: (splitContainer) ->
      @_splitContainer = splitContainer

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
    @newTerminal = document.createElement('archipelago-terminal')
    @newTerminal.tab = @focusedTerminal.tab
    @parentElement = @focusedTerminal.parentElement

  split: ->
    if @firstInContainer()
      @parentElement.insertBefore(@splitContainer, @focusedTerminal)
    else
      @parentElement.appendChild(@splitContainer)

    @splitContainer.appendChild(@focusedTerminal)

    @splitContainer.appendChild(@newTerminal)
    Splitjs([@focusedTerminal, @newTerminal], {
      sizes: [50, 50],
      gutterSize: 1,
      direction: @orientation,
      onDrag: ->
        window.dispatchEvent(new Event('resize'))
    })
    @newTerminal.open()
    @newTerminal.bindDataListeners()
    @newTerminal.fit()
    @newTerminal.xterm.focus()
    window.dispatchEvent(new Event('resize'))

  firstInContainer: ->
    kids = @parentElement.children

    Array.prototype.indexOf.call(kids, @focusedTerminal) == 0 && kids.length == 3
