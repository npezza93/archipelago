import electron from 'electron'
import React from 'react'
import Octicon, {History} from '@githubprimer/octicons-react'
import Pref from 'pref'
import Component from '../utils/component.jsx'

export default class OpenConfig extends Component {
  render() {
    return <div id="open-config" onClick={this.handleClick} title="View Config">
      <Octicon icon={History} size="small" />
    </div>
  }

  initialize() {
    this.pref = new Pref()
  }

  handleClick() {
    electron.shell.openItem(this.pref.path)
  }
}
