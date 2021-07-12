import { Controller } from 'stimulus'
import formatAccelerator from '../../utils/format-accelerator'
import {ipcRenderer as ipc} from 'electron-better-ipc'

export default class extends Controller {
  connect() {
    ipc.answerMain('active-profile-changed', this.setValue.bind(this))
    ipc.answerMain('setting-changed', ({property, value}) => {
      if (property === 'keybindings') {
        this.setValue()
      }
    })
    this.setValue()
  }

  setValue() {
    const article = this.element.querySelector('article')
    const active = [...document.querySelectorAll('[data-controller="keybinding"]')].
      findIndex(item => item.classList.contains('active'))
    article.innerHTML = ''

    currentProfile.get('keybindings').forEach(({keystroke, command}, i) => {
      article.insertAdjacentHTML('beforeend', `<div data-controller='keybinding' data-action='click->keybinding#select dblclick->keybinding#edit' data-keybinding-keystroke-value=${keystroke} data-keybinding-command-value=${command} data-keybinding-index-value=${i}>
        <div class='w-60p'>${formatAccelerator(keystroke) || ''}</div>
        <div>${command}</div>
      </div>`)
    })
    const node = document.querySelectorAll('[data-controller="keybinding"]')[active]
    if (node) node.classList.add('active')
  }
}
