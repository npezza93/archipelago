{ app, BrowserWindow, Menu, shell, ipcMain } = require 'electron'
path                                         = require 'path'
url                                          = require 'url'
AppMenu                                      = require './app_menu'
AutoUpdate                                   = require './auto_update'

settings   = null
about      = null
windows    = []

app.commandLine.appendSwitch('ignore-gpu-blacklist')

resetApplicationMenu = ->
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(AppMenu.menu(about, settings, createWindow))
  )

createWindow = ->
  win = new BrowserWindow(
    width: 1000
    height: 600
    titleBarStyle: (process.platform is 'darwin' && 'hiddenInset') || 'hidden'
    vibrancy: archipelago.config.get('vibrancy')
  )

  win.loadURL(url.format(
    pathname: path.join(__dirname, '../renderer/index.html')
    protocol: 'file:'
    slashes: true
  ))

  win.focus()

  windows.push(win)

  win.webContents.once 'did-frame-finish-load', ->
    if process.platform is 'darwin' || process.platform is 'win32'
      (new AutoUpdate).autoCheck()

app.on 'ready', ->
  createWindow()
  resetApplicationMenu()
  if process.platform is 'darwin'
    app.dock.setMenu(Menu.buildFromTemplate(AppMenu.dock(createWindow)))

app.on 'window-all-closed', ->
  app.quit() if process.platform != 'darwin'

app.on 'activate', ->
  windowCount = 0
  windows.forEach (win) ->
    windowCount += 1 unless win.isDestroyed()

  createWindow() if windowCount == 0

archipelago.config.onDidChange 'vibrancy', (value) ->
  windows.forEach (win) ->
    win.setVibrancy(value) unless win.isDestroyed()

archipelago.config.onDidChange 'singleTabMode', resetApplicationMenu
archipelago.config.onActiveProfileChange resetApplicationMenu

ipcMain.on 'open-hamburger-menu', (ev, args) ->
  Menu.getApplicationMenu().popup(args)
