'use strict';

const key      = require('keymaster');
const Terminal = require(__dirname + '/js/terminal');

let terminals = [];

window.addEventListener('resize', function() {
  for(var terminal of terminals) {
    terminal.fit();
  }
});

function makeTerminal() {
  terminals[terminals.push(new Terminal()) - 1].open();
}

makeTerminal();
document.documentElement.style.setProperty('--cursor-color', 'rgba(171, 178, 191, 0.8)');
document.documentElement.style.setProperty('--background-color', 'rgba(40, 44, 52, 0.1)');

key('⌘+t', makeTerminal);
