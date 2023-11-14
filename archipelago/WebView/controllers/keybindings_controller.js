import { BridgeComponent } from "@hotwired/strada"
import formatKeybinding from '../format_keybinding'

export default class extends BridgeComponent {
  static component = "keybindings"

  connect() {
    super.connect()
    this.send("connect", {}, ({data}) => {
      this.setValue(data)
    })
    this.send("keybindingsChanged", {}, ({data}) => {
      this.setValue(data.value)
    })
  }

  setValue(profile) {
    const article = this.element.querySelector('article');
    const active = [...document.querySelectorAll('[data-controller="keybinding"]')]
      .findIndex(item => item.classList.contains('active'));
    article.innerHTML = '';

    profile.keybindings.forEach(({keystroke, command}, i) => {
      article.insertAdjacentHTML('beforeend', `<div data-controller='keybinding' data-action='click->keybinding#select dblclick->keybinding#edit' data-keybinding-keystroke-value=${keystroke} data-keybinding-command-value=${command} data-keybinding-index-value=${i}>
        <div class='w-60p'>${formatKeybinding(keystroke) || ''}</div>
        <div>${command}</div>
      </div>`);
    });
    const node = document.querySelectorAll('[data-controller="keybinding"]')[active];
    if (node) {
      node.classList.add('active');
    }
  }
}
