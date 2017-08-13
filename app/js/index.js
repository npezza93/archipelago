'use strict';

const key           = require('keymaster');
const QuarkTerminal = require(__dirname + '/js/quark_terminal');

window.addEventListener('resize', function() {
  for(var terminal of document.querySelectorAll('quark-terminal')) {
    terminal.fit();
  };
});

document.documentElement.style.setProperty('--cursor-color', 'rgba(171, 178, 191, 0.8)');
document.documentElement.style.setProperty('--background-color', 'rgba(40, 44, 52, 0.1)');

key('⌘+t', makeTerminal);

function makeTerminal() {
  document.querySelector("body").appendChild(
    document.createElement('quark-terminal')
  );
}
