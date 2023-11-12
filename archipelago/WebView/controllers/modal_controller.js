import {Controller} from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.element.showModal()
  }

  close() {
    this.element.remove()
  }
}
