import ipc from 'electron-better-ipc'
import search from '../windows/search'
import {accelerators} from '../utils'

export default (createWindow, profileManager) => {
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
