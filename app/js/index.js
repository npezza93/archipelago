'use strict';

const QuarkTerminal = require(__dirname + '/js/quark_terminal');

let pressedKeys = [];

window.addEventListener('resize', function() {
  for(var terminal of document.querySelectorAll('quark-terminal')) {
    terminal.fit();
  };
});

document.documentElement.style.setProperty('--cursor-color', 'rgba(171, 178, 191, 0.8)');
document.documentElement.style.setProperty('--background-color', 'rgba(40, 44, 52, 0.1)');

document.addEventListener("keydown", (keyboardEvent) => {
  pressedKeys.push(keyboardEvent.keyCode);
  if (shortcutTriggered([91, 84])) {
    document.querySelector("body").appendChild(document.createElement('quark-terminal'));
  }
  if (shortcutTriggered([91, 83])) {
    console.log('split');
  }
});

document.addEventListener("keyup", () => {
  pressedKeys = [];
});

function shortcutTriggered(shortcut) {
  return pressedKeys.join(",") == shortcut.join(",")
};
