import {shell} from 'electron'

export default {
  role: 'help',
  submenu: [{
    label: 'Report Issue',
    click() {
      shell.openExternal('https://github.com/npezza93/archipelago/issues/new?assignees=npezza93&labels=bug&template=bug_report.md')
    }
  }]
}
