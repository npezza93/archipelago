'use strict';

const key           = require('keymaster');
const Terminal      = require(__dirname + '/js/terminal');

let terminals = {};

window.addEventListener('resize', function() {
  var terminalElement = document.querySelector('.terminal');
  var rows = Math.floor(terminalElement.offsetHeight / 18);
  var cols = Math.floor(terminalElement.offsetWidth / 9);
  var pids = Object.keys(terminals);

  for(var pid of pids) {
    terminals[pid].resize(cols, rows);
  }
});

function spawnTerminal() {
  var initTerm = new Terminal();
  terminals[initTerm.pty.pid] = initTerm;
  initTerm.open();
}

spawnTerminal();
document.documentElement.style.setProperty('--cursor-color', 'rgba(171, 178, 191, 0.8)');
document.documentElement.style.setProperty('--background-color', 'rgba(40, 44, 52, 0.1)');

key('⌘+t', spawnTerminal);
