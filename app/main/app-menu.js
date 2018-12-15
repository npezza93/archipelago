import {api, platform, openNewGitHubIssue} from 'electron-util'
import ipc from 'electron-better-ipc'
import displaySettings from './settings'
import about from './about'
import search from './search'
import darwinAccelerators from './accelerators/darwin'
import linuxAccelerators from './accelerators/linux'
import windowsAccelerators from './accelerators/windows'

const accelerators = platform({
  macos: darwinAccelerators,
  linux: linuxAccelerators,
  windows: windowsAccelerators
})

const aboutMenu = {
  label: api.app.getName(),
  submenu: [
    {
      label: 'About Archipelago',
      click: about.toggle
    },
    {
      label: `Version ${api.app.getVersion()}`,
      enabled: false
    },
    {type: 'separator'},
    {
      label: 'Settings',
      accelerator: accelerators.settings,
      click: displaySettings
    },
    {type: 'separator'},
    ...platform({
      macos: [
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'}
      ],
      default: []
    }),
    {role: 'quit', accelerator: accelerators.quitApp}
  ]
}

const shellMenu = (createWindow, profileManager) => {
  const menu = {
    label: 'Shell',
    submenu: [
      {
        label: 'New Window',
        accelerator: accelerators.newWindow,
        click: createWindow
      },
      {type: 'separator'},
      {
        label: 'Search',
        accelerator: accelerators.search,
        click(item, focusedWindow) {
          search.toggle(focusedWindow.getPosition())
        }
      },
      {
        label: 'Search Next',
        accelerator: accelerators.searchNext,
        click() {
          search.next()
        }
      },
      {
        label: 'Search Previous',
        accelerator: accelerators.searchPrev,
        click() {
          search.previous()
        }
      },
      {type: 'separator'},
      {
        label: 'Split Vertically',
        accelerator: accelerators.splitVertically,
        click(item, focusedWindow) {
          ipc.callRenderer(focusedWindow, 'split', 'vertical')
        }
      },
      {
        label: 'Split Horizontally',
        accelerator: accelerators.splitHorizontally,
        click(item, focusedWindow) {
          ipc.callRenderer(focusedWindow, 'split', 'horizontal')
        }
      }
    ]
  }

  if (!profileManager.get('singleTabMode')) {
    menu.submenu.push(
      {type: 'separator'},
      {
        label: 'New Tab',
        accelerator: accelerators.newTab,
        click(item, focusedWindow) {
          ipc.callRenderer(focusedWindow, 'new-tab')
        }
      }
    )
  }

  menu.submenu.push(
    {type: 'separator'},
    {
      label: 'Close',
      accelerator: accelerators.close,
      click(item, focusedWindow) {
        if (focusedWindow.name === 'visor') {
          focusedWindow.hideVisor()
        } else {
          focusedWindow.webContents.send('close-via-menu')
        }
      }
    }
  )

  return menu
}

const editMenu = {
  label: 'Edit',
  submenu: [
    {role: 'undo', accelerator: accelerators.undo},
    {role: 'redo', accelerator: accelerators.redo},
    {type: 'separator'},
    {role: 'cut', accelerator: accelerators.cut},
    {role: 'copy', accelerator: accelerators.copy},
    {role: 'paste', accelerator: accelerators.paste},
    {role: 'selectall', accelerator: accelerators.selectAll}
  ]
}

const viewMenu = {
  label: 'View',
  submenu: [
    {role: 'reload', accelerator: accelerators.reload},
    {role: 'forcereload', accelerator: accelerators.forceReload},
    {role: 'toggledevtools', accelerator: accelerators.toggleDevtools},
    {type: 'separator'},
    {role: 'resetzoom', accelerator: accelerators.resetZoom},
    {role: 'zoomin', accelerator: accelerators.zoomIn},
    {role: 'zoomout', accelerator: accelerators.zoomOut},
    {type: 'separator'},
    {role: 'togglefullscreen', accelerator: accelerators.toggleFullscreen}
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

        if (profileManager.activeProfile().id === profile.id) {
          profileItem.checked = true
        }
        return profileItem
      })
  }
}

const windowMenu = {
  role: 'window',
  submenu: platform({
    macos: [
      {role: 'minimize', accelerator: accelerators.minimize},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ],
    default: [{role: 'minimize', accelerator: accelerators.minimize}]
  })
}

const helpMenu = {
  role: 'help',
  submenu: [{
    label: 'Report Issue',
    click() {
      openNewGitHubIssue({user: 'npezza93', repo: 'archipelago'})
    }
  }]
}

export default (createWindow, profileManager) => {
  return [
    aboutMenu,
    shellMenu(createWindow, profileManager),
    editMenu,
    viewMenu,
    profilesMenu(profileManager),
    windowMenu,
    helpMenu
  ]
}
