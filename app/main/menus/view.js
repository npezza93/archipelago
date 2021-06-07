import {is} from 'electron-util'

let dev_menus
if (is.development) {
  dev_menus = [
    {role: 'reload', accelerator: "Cmd+R"},
    {role: 'forcereload', accelerator: "Cmd+Shift+R"},
    {role: 'toggledevtools', accelerator: "Cmd+Alt+I"}
  ]
}

export default {
  label: 'View',
  submenu: [
    ...dev_menus,
    {type: 'separator'},
    {role: 'resetzoom', accelerator: "Cmd+0"},
    {role: 'zoomin', accelerator: "Cmd+Plus"},
    {role: 'zoomout', accelerator: "Cmd+-"},
    {type: 'separator'},
    {role: 'togglefullscreen', accelerator: "Ctrl+Cmd+F"}
  ]
}
