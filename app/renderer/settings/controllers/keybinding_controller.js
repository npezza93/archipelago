import { Controller } from 'stimulus'
import {ipcRenderer as ipc} from 'electron-better-ipc'

export default class extends Controller {
  static values = { keystroke: String, command: String }

  select(event) {
    document.querySelectorAll('#keybindings article > div').forEach(row => {
      row.classList.remove('active')
    })
    this.element.classList.add('active')
  }

  edit(event) {
    document.body.insertAdjacentHTML('beforeend', `<div class="backdrop" data-controller='keybinding-capturer'>
      <div class='modal'>
        <div class='flex flex-col h-full w-full'>
          <div class='flex-1 flex flex-col w-full align-center gap-10 mt-15'>
            <div data-keybinding-capturer-target='keystroke'>${this.keystrokeValue}</div>
            <input type="text" name="command" value="${this.commandValue}" autofocus class='w-60p' data-keybinding-capturer-target='command'>
          </div>
          <div class='footer flex flex-row justify-end'>
            <button class='cancel' data-action='keybinding-capturer#close'>Cancel</button>
            <button class='ok' data-action='keybinding-capturer#save'>OK</button>
          </div>
        </div>
      </div>
    </div>`)
  }
}
