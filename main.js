const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')
const url = require('url')
const ConfigFile = require(path.join(__dirname, '/app/js/config_file'))

let win
let configFile = new ConfigFile()
let settings

function createWindow () {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    titleBarStyle: 'hidden-inset',
    vibrancy: configFile.contents.vibrancy
  })
  const template = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Report Issue',
          click() { shell.openExternal('https://github.com/npezza93/archipelago/issues/new') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: function() {
            if (settings === undefined || settings.isDestroyed()) {
              settings = new BrowserWindow({
                width: 550,
                height: 600,
                show: true,
                titleBarStyle: 'hidden-inset',
                icon: path.join(__dirname, '/assets/png_icon.png')
              })

              settings.loadURL(url.format({
                pathname: path.join(__dirname, '/app/settings.html'),
                protocol: 'file:',
                slashes: true
              }))
            }

            settings.focus()
          }
        },
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })

    // Window menu
    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadURL(url.format({
    pathname: path.join(__dirname, '/app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.focus()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  configFile.on('change', () => {
    win.setVibrancy(configFile.contents.vibrancy)
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
