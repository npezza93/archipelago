import {openNewGitHubIssue} from 'electron-util'

export default {
  role: 'help',
  submenu: [{
    label: 'Report Issue',
    click() {
      openNewGitHubIssue({user: 'npezza93', repo: 'archipelago'})
    }
  }]
}
