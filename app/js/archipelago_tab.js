'use strict'

class ArchipelagoTab extends HTMLElement {
  connectedCallback() {
    let terminal = document.createElement('archipelago-terminal')
    this.container = document.createElement('div')
    this.titleContainer = document.createElement('span')
    this.appendChild(this.titleContainer)

    document.querySelector('body').appendChild(this.container)
    this.container.appendChild(terminal)
    this.container.classList.add('tab-container')
    terminal.tab = this
    terminal.open()
    terminal._bindDataListeners()
    this._bindClickHandler()
    this.focus()
    terminal.fit()
    this._addExit()
  }

  disconnectedCallback() {
    this.container.remove()
  }

  focus() {
    for (var tab of document.querySelectorAll('archipelago-tab')) {
      tab.container.classList.add('hidden')
      tab.classList.remove('active')
    }

    this.container.classList.remove('hidden')
    this.terminals[0].xterm.focus()
    this.classList.add('active')
  }

  get terminals() {
    return this.container.querySelectorAll('archipelago-terminal')
  }

  set title(title) {
    this.titleContainer.innerText = title
  }

  _bindClickHandler() {
    this.addEventListener('click', function(event) {
      if (event.target.localName === 'archipelago-tab') {
        event.target.focus()
      }
      if (event.target.localName === 'span') {
        event.target.parentElement.focus()
      }
    })
  }

  _addExit() {
    var exitSymbol = document.createElement('div')
    exitSymbol.innerHTML = '&times'
    this.appendChild(exitSymbol)

    exitSymbol.addEventListener('click', () => {
      this.remove()
    })
  }
}

module.exports = ArchipelagoTab
window.customElements.define('archipelago-tab', ArchipelagoTab)
