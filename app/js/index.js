const {ipcRenderer} = require("electron")
const Terminal      = require("xterm")
const pty           = require('node-pty')
const defaultShell  = require('default-shell')

let log = ''
let ptyProcess = pty.spawn(defaultShell, [], {
  name: 'xterm-256color',
  cwd: process.env.PWD,
  env: process.env
})
let term = new Terminal({
  cursorBlink: true,
  // block | underline | bar
  cursorStyle: "block",
  rows: Math.floor((window.innerHeight - 25) / 18),
  cols: Math.floor(window.innerWidth - 15 / 15)
})

term.open(document.getElementById("terminal"), true)
term.element.classList["add"]("fullscreen")
term.on("data", (data) => {
  ptyProcess.write(data);
})
ptyProcess.on("data", (data) => {
  term.write(data);
  log += data;
})
term._initialized = true


ipcRenderer.on("resize", (event, params) => {
  term.resize(params.cols, params.rows);
})

document.documentElement.style.setProperty(`--cursor-color`, 'rgba(171, 178, 191, 0.8)')
document.documentElement.style.setProperty(`--background-color`, 'rgba(40, 44, 52, 0.1)')
