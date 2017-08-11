'use strict';

class Tab {
  constructor(terminal) {
    this.terminal = terminal;

    this._setTabElement();
    this._setClickHandler();
    this._setTitleHandler();
  }

  create() {
    document.querySelector('#titlebar').appendChild(this.tabElement);
  }

  activate() {
    for(var terminal of document.querySelectorAll('.qterminal')) {
      terminal.classList.add('hidden');
    }
    for(var tab of document.querySelectorAll('.tab')) {
      tab.classList.remove('active');
    }

    document.querySelector(".qterminal[data-pid='" + this.terminal.pty.pid + "']").classList.remove('hidden');
    this.terminal.xterm.focus();
    this.tabElement.classList.add('active');
  }

  _setTabElement() {
    this.tabElement = document.createElement('div');
    this.tabElement.classList.add('tab');
    this.tabElement.dataset['pid'] = this.terminal.pty.pid;
    this.tabElement.innerText = this.terminal.xterm.title;
  }

  _setClickHandler() {
    this.tabElement.addEventListener('click', function(event) {
      for(var terminal of document.querySelectorAll('.qterminal')) {
        terminal.classList.add('hidden');
      }
      for(var tab of document.querySelectorAll('.tab')) {
        tab.classList.remove('active');
      }

      document.querySelector(".qterminal[data-pid='" + event.target.dataset.pid + "']").classList.remove('hidden');
      event.target.classList.add("active");
    });
  }

  _setTitleHandler() {
    this.terminal.xterm.on('title', (title) => {
      this.tabElement.innerText = title
    });
  }
};

module.exports = Tab;
