import {Controller} from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.fonts = window.fonts.map(font => JSON.parse(font))

    let css = this.fonts.map((font) => {
      return `@font-face {
        font-family: '${font.name}';
        src: url('data:font/${font.format};base64,${font.base64}');
      }`
    }).join("\n\n")
    let inits = this.fonts.map((font) => {
      return `<div style="position:fixed;top:100000px;left:1000000px;font-family: '${font.name}'">${font.name}</div>`
    }).join("")
    let style = document.createElement('style');
    style.innerHTML = css
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', inits)
  }
}
