import { Controller } from 'stimulus'
import formatAccelerator from '../../utils/format-accelerator'
import {ipcRenderer as ipc} from 'electron-better-ipc'

export default class extends Controller {
  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    this.setValue()
  }

  setValue() {
    const article = this.element.querySelector('article')
    article.innerHTML = ''

    currentProfile.get('keybindings').forEach(({keystroke, command}) => {
      article.insertAdjacentHTML('beforeend', `<div data-controller='keybinding' data-action='click->keybinding#select dblclick->keybinding#edit' data-keybinding-keystroke-value=${keystroke} data-keybinding-command-value=${command}>
        <div class='w-60p'>${formatAccelerator(keystroke) || ''}</div>
        <div>${command}</div>
      </div>`)
    })
  }
}
