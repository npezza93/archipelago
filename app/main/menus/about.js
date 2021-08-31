import {app} from 'electron';
import about from '../windows/about';
import settings from '../windows/settings';

export default {
  label: app.name,
  submenu: [
    {
      label: 'About Archipelago',
      click: about.toggle,
    },
    {
      label: `Version ${app.getVersion()}`,
      enabled: false,
    },
    {type: 'separator'},
    {
      label: 'Preferences',
      accelerator: 'Cmd+,',
      click: settings.toggle,
    },
    {type: 'separator'},
    {role: 'services', submenu: []},
    {type: 'separator'},
    {role: 'hide'},
    {role: 'hideothers'},
    {role: 'unhide'},
    {type: 'separator'},
    {role: 'quit', accelerator: 'Cmd+Q'},
  ],
};
