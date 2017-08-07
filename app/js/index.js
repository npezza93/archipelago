const {ipcRenderer} = require("electron")
const Terminal      = require("xterm")

let term = new Terminal({
  cursorBlink: true,
  // block | underline | bar
  cursorStyle: "block",
  rows: Math.floor((window.innerHeight - 25) / 18)
})

term.open(document.getElementById("terminal"), true)
term.element.classList["add"]("fullscreen")
ipcRenderer.send("create-terminal")

ipcRenderer.on("created-terminal", (event, pid) => {
  window.pid = pid;
  term._initialized = true;
})

ipcRenderer.on("updated-terminal", (event, arg) => {
  term.write(arg)
})

term.on("data", function(data) {
  ipcRenderer.send("update-terminal", {
    pid: window.pid,
    data: data
  });
})

document.documentElement.style.setProperty(`--cursor-color`, 'rgba(171, 178, 191, 0.8)')
document.documentElement.style.setProperty(`--background-color`, 'rgba(40, 44, 52, 0.1)')
