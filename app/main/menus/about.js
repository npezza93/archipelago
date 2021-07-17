import {api} from 'electron-util';
import about from '../windows/about';
import settings from '../windows/settings';

export default {
  label: api.app.name,
  submenu: [
    {
      label: 'About Archipelago',
      click: about.toggle,
    },
    {
      label: `Version ${api.app.getVersion()}`,
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
