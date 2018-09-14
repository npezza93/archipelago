const {app, BrowserWindow, shell} = require('electron')
const path = require('path')
const url = require('url')
const settings = require('./settings')

module.exports =
class AppMenu {
  static dock(createWindow) {
    return [
      {
        label: 'New Window',
        click: createWindow
      }
    ]
  }

  static menu(about, settings, createWindow, profileManager) {
    const template = [
      this.aboutMenu(about, settings),
      this.shellMenu(createWindow, profileManager),
      this.editMenu(),
      this.viewMenu(),
      this.profilesMenu(profileManager),
      this.windowMenu(),
      this.helpMenu()
    ]

    return template
  }

  static shellMenu(createWindow, profileManager) {
    return {
      label: 'Shell',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: createWindow
        },
        {type: 'separator'},
        {
          label: 'Split Vertically',
          accelerator: 'CmdOrCtrl+Shift+S',
          click(item, focusedWindow) {
            if (focusedWindow) {
              return focusedWindow.send('split-vertical')
            }
          }
        },
        {
          label: 'Split Horizontally',
          accelerator: 'CmdOrCtrl+S',
          click(item, focusedWindow) {
            if (focusedWindow) {
              return focusedWindow.send('split-horizontal')
            }
          }
        }
      ].concat(this.newTabItem(profileManager))
    }
  }

  static newTabItem(profileManager) {
    if (!profileManager.get('singleTabMode')) {
      return [
        {type: 'separator'},
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click(item, focusedWindow) {
            if (focusedWindow) {
              return focusedWindow.send('new-tab')
            }
          }
        }
      ]
    }
    return []
  }

  static editMenu() {
    return {
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
    }
  }

  static viewMenu() {
    return {
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
    }
  }

  static profilesMenu(profileManager) {
    return {
      label: 'Profiles',
      submenu:
        profileManager.profileIds.map(profileId => {
          const profileItem = {
            label: profileManager.find(profileId).name,
            type: 'radio',
            click() {
              profileManager.activeProfileId = profileId
            }
          }

          if (profileManager.activeProfileId === parseInt(profileId, 10)) {
            profileItem.checked = true
          }
          return profileItem
        })
    }
  }

  static windowMenu() {
    const currentMenu = {
      role: 'window',
      submenu: [{role: 'minimize'}, {role: 'close'}]
    }

    if (process.platform === 'darwin') {
      currentMenu.submenu = [
        {role: 'close'},
        {role: 'minimize'},
        {role: 'zoom'},
        {type: 'separator'},
        {role: 'front'}
      ]
    }

    return currentMenu
  }

  static helpMenu() {
    return {
      role: 'help',
      submenu: [{
        label: 'Report Issue',
        click() {
          return shell.openExternal('https://github.com/npezza93/archipelago/issues/new')
        }
      }]
    }
  }

  static aboutMenu(about, settings) {
    return {
      label: app.getName(),
      submenu: [
        {
          label: 'About Archipelago',
          click() {
            if ((about === null) || about.isDestroyed()) {
              about = new BrowserWindow({
                width: 300,
                height: 500,
                show: true,
                titleBarStyle: 'hiddenInset',
                frame: process.platform === 'darwin',
                icon: path.join(__dirname, '../../../build/icon.png')
              })

              about.loadURL(url.format({
                pathname: path.join(__dirname, '../about/index.html'),
                protocol: 'file:',
                slashes: true
              }))

              return about.focus()
            }
          }
        },
        {
          label: `Version ${app.getVersion()}`,
          enabled: false
        },
        {type: 'separator'},
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click() {
            settings.display()
          }
        },
        {type: 'separator'},
        ...(() => {
          if (process.platform === 'darwin') {
            return [
              {role: 'services', submenu: []},
              {type: 'separator'},
              {role: 'hide'},
              {role: 'hideothers'},
              {role: 'unhide'},
              {type: 'separator'}
            ]
          }

          return []
        })(),
        {role: 'quit'}
      ].filter(item => item !== null)
    }
  }
}
