import {shell} from 'electron';

export default profileManager => ({
  role: 'help',
  submenu: [
    {
      label: 'Export settings',
      click() {
        shell.showItemInFolder(profileManager.configFile.path)
      }
    },
    {type: 'separator'},
    {
      label: 'Report Issue',
      click() {
        shell.openExternal('https://github.com/npezza93/archipelago/issues/new?assignees=npezza93&labels=bug&template=bug_report.md');
      },
    }
  ],
});
