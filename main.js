const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const webContents =electron.webContents;
const path = require('path');
const url = require('url');
const express = require('express');
const server = express();
const expressWs = require('express-ws')(server);
const os = require('os');
const pty = require('node-pty');
const defaultShell = require('default-shell');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: "hidden"
  })

  win.loadURL('http://localhost:3000/');
  win.focus();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
let terminals = {};
let logs = {};

server.get('/', function(req, res) {
  res.sendFile(__dirname + '/app/index.html');
});

server.use('/scripts', express.static(path.join(__dirname, 'node_modules/xterm/dist')));
server.use('/styles', express.static(path.join(__dirname, 'node_modules/xterm/dist')));
server.use('/js', express.static(path.join(__dirname, 'app/js')));
server.use('/css', express.static(path.join(__dirname, 'app/css')));

server.post('/terminals', function (req, res) {
  var term = pty.spawn(defaultShell, [], {
    name: 'xterm-256color',
    cwd: process.env.PWD,
    env: process.env
  });

  terminals[term.pid] = term;
  logs[term.pid] = '';
  term.on('data', function(data) {
    logs[term.pid] += data;
  });
  res.send(term.pid.toString());
  res.end();
});

server.post('/terminals/:pid/size', function (req, res) {
  var pid = parseInt(req.params.pid),
      cols = parseInt(req.query.cols),
      rows = parseInt(req.query.rows),
      term = terminals[pid];

  term.resize(cols, rows);
  res.end();
});

server.ws('/terminals/:pid', function (ws, req) {
  var term = terminals[parseInt(req.params.pid)];
  ws.send(logs[term.pid]);

  term.on('data', function(data) {
    try {
      ws.send(data);
    } catch (ex) {
    }
  });
  ws.on('message', function(msg) {
    term.write(msg);
  });
  ws.on('close', function () {
    term.kill();
    console.log('Closed terminal ' + term.pid);
    // Clean things up
    delete terminals[term.pid];
    delete logs[term.pid];
  });
});

server.listen(process.env.PORT || 3000);
