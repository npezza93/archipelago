import { Controller } from 'stimulus'
import {ipcRenderer as ipc} from 'electron-better-ipc'

export default class extends Controller {
  static targets = ['command', 'keystroke']

  connect() {
    this.commandTarget.focus()
  }

  close() {
    this.element.remove()
  }

  save() {
    this.close()
  }
}
