const {app, shell} = require('electron')

const settings = require('./settings')
const about = require('./about')

const extraDarwinAboutItems = () => {
  let items = []

  if (process.platform === 'darwin') {
    items = [
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'}
    ]
  } else {
    items = []
  }

  return items
}

const aboutMenu = {
  label: app.getName(),
  submenu: [
    {
      label: 'About Archipelago',
      click() {
        about.display()
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
    ...extraDarwinAboutItems(),
    {role: 'quit'}
  ]
}

const shellMenu = (createWindow, profileManager) => {
  const menu = {
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
    ]
  }

  if (profileManager.get('singleTabMode')) {
    menu.submenu.push(
      {type: 'separator'},
      {
        label: 'Close Window',
        accelerator: 'CmdOrCtrl+W',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.close()
          }
        }
      }
    )
  } else {
    menu.submenu.push(
      {type: 'separator'},
      {
        label: 'New Tab',
        accelerator: 'CmdOrCtrl+T',
        click(item, focusedWindow) {
          if (focusedWindow) {
            return focusedWindow.send('new-tab')
          }
        }
      },
      {type: 'separator'},
      {
        label: 'Close Tab',
        accelerator: 'CmdOrCtrl+W',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.send('close-current-tab')
          }
        }
      },
      {
        label: 'Close Window',
        accelerator: 'CmdOrCtrl+Shift+W',
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.close()
          }
        }
      }
    )
  }

  return menu
}

const editMenu = {
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

const viewMenu = {
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

const profilesMenu = profileManager => {
  return {
    label: 'Profiles',
    submenu:
      profileManager.all().map(profile => {
        const profileItem = {
          label: profile.name,
          type: 'radio',
          click() {
            profileManager.activeProfileId = profile.id
          }
        }

        if (profileManager.activeProfileId === profile.id) {
          profileItem.checked = true
        }
        return profileItem
      })
  }
}

const windowMenu = () => {
  const menu = {role: 'window', submenu: [{role: 'minimize'}]}

  if (process.platform === 'darwin') {
    menu.submenu.push({role: 'zoom'}, {type: 'separator'}, {role: 'front'})
  }

  return menu
}

const helpMenu = {
  role: 'help',
  submenu: [{
    label: 'Report Issue',
    click() {
      shell.openExternal('https://github.com/npezza93/archipelago/issues/new')
    }
  }]
}

exports.template = (createWindow, profileManager) => {
  return [
    aboutMenu,
    shellMenu(createWindow, profileManager),
    editMenu,
    viewMenu,
    profilesMenu(profileManager),
    windowMenu(),
    helpMenu
  ]
}
