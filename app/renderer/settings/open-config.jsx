import electron from 'electron'
import React from 'react'
import Octicon, {History} from '@githubprimer/octicons-react'
import Component from '../utils/component.jsx'
import './open-config.css'

export default class OpenConfig extends Component {
  render() {
    return <open-config onClick={this.handleClick} title="View Config">
      <Octicon icon={History} size="small" />
    </open-config>
  }

  handleClick() {
    electron.shell.openItem(this.props.pref.path)
  }
}
