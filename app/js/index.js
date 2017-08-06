let socket;
let terminalContainer = document.getElementById('terminal');

let term = new Terminal({
  cursorBlink: true,
  rows: Math.floor((window.innerHeight - 25) / 18)
});

protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + '/terminals/';

term.open(terminalContainer);
term.toggleFullscreen();

fetch('/terminals', {method: 'POST'}).then(function (res) {
  res.text().then(function (pid) {
    window.pid = pid;
    socketURL += pid;
    socket = new WebSocket(socketURL);
    socket.onopen = runRealTerminal;
  });
});

function runRealTerminal() {
  term.attach(socket);
  term._initialized = true;
}
