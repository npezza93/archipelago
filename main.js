const {app, BrowserWindow, webContents, ipcMain} = require('electron');
const path = require('path');
const url  = require('url');
const pty = require('node-pty');
const defaultShell = require('default-shell');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let terminals = {};
let logs = {};

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: "hidden",
    vibrancy: 'ultra-dark'
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.focus();
  win.webContents.openDevTools();

  ipcMain.on('create-terminal', (event, arg) => {
    // generate a pty terminal
    var term = pty.spawn(defaultShell, [], {
      name: 'xterm-256color',
      cwd: process.env.PWD,
      env: process.env
    });

    // save the terminal to the terminals hash
    terminals[term.pid] = term;
    // initialize the terminals log
    logs[term.pid] = '';
    // once we get data back update the log and send a response
    term.on('data', function(data) {
      logs[term.pid] += data;
      event.sender.send('updated-terminal', data);
    });

    event.sender.send('created-terminal', term.pid.toString());
  });

  ipcMain.on('update-terminal', (event, params) => {
    terminals[parseInt(params.pid)].write(params.data);
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null

    // term.kill();
    // Clean things up
    // delete terminals[term.pid];
    // delete logs[term.pid];
  })
}

app.on('ready', createWindow)

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

// server.post('/terminals/:pid/size', function (req, res) {
//   var pid = parseInt(req.params.pid),
//       cols = parseInt(req.query.cols),
//       rows = parseInt(req.query.rows),
//       term = terminals[pid];
//
//   term.resize(cols, rows);
//   res.end();
// });
