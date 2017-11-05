require('../utils/attr')

class ArchipelagoTab extends HTMLElement
  @attr 'title',
    get: ->
      @titleContainer.innerText
    set: (title) ->
      @titleContainer.innerText = title

  connectedCallback: ->
    terminal = document.createElement('archipelago-terminal')
    @container = document.createElement('div')
    @titleContainer = document.createElement('span')
    @appendChild(@titleContainer)

    document.querySelector('body').appendChild(@container)
    @container.appendChild(terminal)
    @container.classList.add('tab-container')
    terminal.tab = this
    terminal.open()
    terminal.bindDataListeners()
    @bindClick()
    @focus()
    @addExit()

  disconnectedCallback: ->
    @container.remove()

  focus: ->
    document.querySelectorAll('archipelago-tab').forEach (tab) =>
      tab.container.classList.add('hidden')
      tab.classList.remove('active')

    @container.classList.remove('hidden')
    @classList.add('active')
    @terminals(0).xterm.focus()
    @classList.remove('is-unread')

  isActive: ->
    @classList.contains('active')

  terminals: (index) ->
    terminals = Array.prototype.slice.call(
      @container.querySelectorAll('archipelago-terminal')
    )

    if index > -1
      terminals[index]
    else
      terminals

  bindClick: ->
    @addEventListener 'click', (event) =>
      if event.target.localName == 'archipelago-tab'
        event.target.focus()

      if event.target.localName == 'span'
        event.target.parentElement.focus()

  addExit: ->
    exitSymbol = document.createElement('div')
    exitSymbol.innerHTML = '&times'
    @appendChild(exitSymbol)

    exitSymbol.addEventListener 'click', () =>
      @remove()

module.exports = ArchipelagoTab
window.customElements.define('archipelago-tab', ArchipelagoTab)
