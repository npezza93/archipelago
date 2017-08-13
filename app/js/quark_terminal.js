'use strict';

const Pty          = require('node-pty')
const defaultShell = require('default-shell')
const XTerm        = require('xterm')
const QuarkTab     = require(__dirname + '/quark_tab');

class QuarkTerminal extends HTMLElement {
  connectedCallback() {
    this._setPty();
    this._setXTerm();
    this.open();
  }

  disconnectedCallback() {
    this.xterm.destroy();
    this.pty.kill();
  }

  open() {
    this.xterm.open(this, true);
    this._bindDataListeners();
    this.xterm.element.classList.add('fullscreen');
    this.tab = new QuarkTab(this);
    document.querySelector('#titlebar').appendChild(this.tab);
    this.fit();
  }

  fit() {
    var rows = Math.floor(this.xterm.element.offsetHeight / 18);
    var cols = Math.floor(this.xterm.element.offsetWidth / 9);

    this.xterm.resize(cols, rows);
    this.pty.resize(cols, rows);
  }

  hide() {
    this.classList.add('hidden');
    this.tab.classList.remove('active');
  }

  _setPty() {
    this.pty = Pty.spawn(defaultShell, [], {
      name: 'xterm-256color',
      cwd: process.env.PWD,
      env: process.env
    });
  }

  _setXTerm() {
    this.xterm = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block', // block | underline | bar
      visualBell: true,
      popOnBell: true
    });
  }

  _bindDataListeners() {
    this.xterm.on('data', (data) => {
      this.pty.write(data);
    });
    this.pty.on('data', (data) => {
      this.xterm.write(data)
    });
    this.pty.on('exit',() => {
      this.remove();
      this.tab.remove();
      document.querySelector('quark-tab').activate();
    });
  }
};

module.exports = QuarkTerminal;
window.customElements.define('quark-terminal', QuarkTerminal);
