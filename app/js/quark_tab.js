'use strict';

class QuarkTab extends HTMLElement {
  constructor(terminal) {
    super();
    this.terminal = terminal;
  }

  connectedCallback() {
    this.innerText = this.terminal.xterm.title;
    this._setClickHandler();
    this._setTitleHandler();
    document.querySelector('#titlebar').appendChild(this);
    this.activate();
  }

  activate() {
    for(var terminal of document.querySelectorAll('quark-terminal')) {
      terminal.hide();
    };

    this.terminal.classList.remove('hidden');
    this.terminal.xterm.focus();
    this.classList.add('active');
  }

  _setClickHandler() {
    this.addEventListener('click', function(event) {
      if (event.target.localName == "quark-tab") {
        event.target.activate();
      }
    });
  }

  _setTitleHandler() {
    this.terminal.xterm.on('title', (title) => {
      this.innerText = title
    });
  }
};

module.exports = QuarkTab;
window.customElements.define('quark-tab', QuarkTab);
