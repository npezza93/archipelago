import {app} from 'electron';

let devMenus = [];
if (!app.isPackaged) {
  devMenus = [
    {role: 'reload', accelerator: 'Cmd+R'},
    {role: 'forcereload', accelerator: 'Cmd+Shift+R'},
    {role: 'toggledevtools', accelerator: 'Cmd+Alt+I'},
  ];
}

export default {
  label: 'View',
  submenu: [
    ...devMenus,
    {type: 'separator'},
    {role: 'resetzoom', accelerator: 'Cmd+0'},
    {role: 'zoomin', accelerator: 'Cmd+Plus'},
    {role: 'zoomout', accelerator: 'Cmd+-'},
    {type: 'separator'},
    {role: 'togglefullscreen', accelerator: 'Ctrl+Cmd+F'},
  ],
};
