const {ipcRenderer} = require("electron")
const Terminal      = require("xterm")
const Pty           = require("node-pty")
const defaultShell  = require("default-shell")

let log = ""

var initRows = Math.floor((window.innerHeight - 25) / 18)
var initCols = Math.floor((window.innerWidth - 30) / 9)

let pty = Pty.spawn(defaultShell, [], {
  name: "xterm-256color",
  cwd: process.env.PWD,
  env: process.env,
  rows: initRows,
  cols: initCols
})

let term = new Terminal({
  cursorBlink: true,
  // block | underline | bar
  cursorStyle: "block",
  rows: initRows,
  cols: initCols
})

term.open(document.getElementById("terminal"), true)
term.element.classList["add"]("fullscreen")

term.on("data", (data) => {
  pty.write(data)
})
pty.on("data", (data) => {
  term.write(data)
  log += data
})

window.addEventListener("resize", function() {
  terminalElement = document.getElementsByClassName("terminal")[0];
  rows = Math.floor(terminalElement.offsetHeight / 18);
  cols = Math.floor(terminalElement.offsetWidth / 9);
  
  term.resize(cols, rows);
  pty.resize(cols, rows);
})

document.documentElement.style.setProperty("--cursor-color", "rgba(171, 178, 191, 0.8)")
document.documentElement.style.setProperty("--background-color", "rgba(40, 44, 52, 0.1)")
