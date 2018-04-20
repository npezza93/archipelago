{ app, BrowserWindow, shell, autoUpdater, dialog } = require 'electron'
path = require 'path'
url  = require 'url'

module.exports =
class AppMenu
  @dock: (createWindow) ->
    [
      {
        label: 'New Window'
        click: createWindow
      }
    ]

  @menu: (about, settings, createWindow) ->
    template = [
      @aboutMenu(about, settings)
      @shellMenu(createWindow)
      @editMenu()
      @viewMenu()
      @profilesMenu()
      @windowMenu()
      @helpMenu()
    ]

    template

  @shellMenu: (createWindow) ->
    label: 'Shell'
    submenu: [
      {
        label: 'New Window'
        accelerator: 'CmdOrCtrl+N'
        click: createWindow
      }
      { type: 'separator' }
      {
        label: 'Split Vertically'
        accelerator: 'CmdOrCtrl+Shift+S'
        click: (item, focusedWindow) ->
          if focusedWindow then focusedWindow.send('split-vertical')
      }
      {
        label: 'Split Horizontally'
        accelerator: 'CmdOrCtrl+S'
        click: (item, focusedWindow) ->
          if focusedWindow then focusedWindow.send('split-horizontal')
      }
    ].concat(@newTabItem())

  @newTabItem: ->
    if !archipelago.config.get('singleTabMode')
      [
        { type: 'separator' }
        {
          label: 'New Tab'
          accelerator: 'CmdOrCtrl+T'
          click: (item, focusedWindow) ->
            if focusedWindow then focusedWindow.send('new-tab')
        }
      ]
    else
      []

  @editMenu: ->
    label: 'Edit'
    submenu: [
      { role: 'undo' }
      { role: 'redo' }
      { type: 'separator' }
      { role: 'cut' }
      { role: 'copy' }
      { role: 'paste' }
      { role: 'selectall' }
    ]

  @viewMenu: ->
    label: 'View'
    submenu: [
      { role: 'reload' }
      { role: 'forcereload' }
      { role: 'toggledevtools' }
      { type: 'separator' }
      { role: 'resetzoom' }
      { role: 'zoomin' }
      { role: 'zoomout' }
      { type: 'separator' }
      { role: 'togglefullscreen' }
    ]

  @profilesMenu: ->
    label: 'Profiles'
    submenu:
      archipelago.config.profileIds.map (profileId) ->
        profileItem =
          label: archipelago.config.getProfileName(profileId)
          type: 'radio'
          click: (item, focusedWindow) ->
            archipelago.config.setActiveProfileId(profileId)

        if archipelago.config.activeProfileId == parseInt(profileId)
          profileItem.checked = true
        profileItem

  @windowMenu: ->
    currentMenu =
      role: 'window'
      submenu: [
        { role: 'minimize' }
        { role: 'close' }
      ]

    if process.platform is 'darwin'
      currentMenu.submenu = [
        { role: 'close' }
        { role: 'minimize' }
        { role: 'zoom' }
        { type: 'separator' }
        { role: 'front' }
      ]

    currentMenu

  @helpMenu: ->
    role: 'help'
    submenu: [
      label: 'Report Issue'
      click: ->
        shell.openExternal('https://github.com/npezza93/archipelago/issues/new')
    ]

  @aboutMenu: (about, settings) ->
    label: app.getName()
    submenu: [
      {
        label: 'About Archipelago'
        click: ->
          if !about? || about.isDestroyed()
            about = new BrowserWindow(
              width: 300
              height: 500
              show: true
              titleBarStyle: 'hiddenInset'
              frame: process.platform is 'darwin'
              icon: path.join(__dirname, '../../../build/icon.png')
            )

            about.loadURL(url.format(
              pathname: path.join(__dirname, '../about/index.html')
              protocol: 'file:'
              slashes: true
            ))

            about.focus()
      }
      {
        label: "Version #{app.getVersion()}"
        enabled: false
      }
      if process.platform is 'darwin' || process.platform is 'win32'
        {
          label: 'Check for Update'
          click: ->
            if process.platform is 'darwin' || process.platform is 'win32'
              autoUpdater.on 'update-not-available', () ->
                dialog.showMessageBox {
                  type: 'info',
                  message: 'No update available',
                  detail: "Version #{app.getVersion()} is the latest version."
                }
              autoUpdater.checkForUpdates()
        }
      { type: 'separator' }
      {
        label: 'Settings'
        accelerator: 'CmdOrCtrl+,'
        click: ->
          if !settings? || settings.isDestroyed()
            settings = new BrowserWindow({
              width: 1100
              height: 600
              show: true
              titleBarStyle: 'hiddenInset'
              frame: process.platform is 'darwin'
              icon: path.join(__dirname, '../../../build/icon.png')
              webPreferences:
                experimentalFeatures: true
            })

            settings.loadURL(url.format(
              pathname: path.join(__dirname, '../settings/index.html')
              protocol: 'file:'
              slashes: true
            ))

          settings.focus()
      }
      { type: 'separator' }
      if process.platform is 'darwin'
        { role: 'services', submenu: [] }
        { type: 'separator' }
        { role: 'hide' }
        { role: 'hideothers' }
        { role: 'unhide' }
        { type: 'separator' }
      { role: 'quit' }
    ].filter (item) -> item?
