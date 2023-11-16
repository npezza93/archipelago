import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "profile"
  static values = { name: String, id: Number }

  connect() {
    super.connect()
  }

  select() {
    document.querySelectorAll('#profiles article > div').forEach(row => {
      row.classList.remove('active');
    });
    this.element.classList.add('active');
    this.send("change", {id: this.idValue})
  }

  edit() {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog data-controller='modal profile-capturer' data-action="close->modal#close" data-profile-capturer-id-value=${this.idValue}>
        <div class='flex flex-col h-full w-full'>
          <div class='flex-1 flex flex-col w-full align-center gap-10 mt-15'>
            <input type="text" name="name" value="${this.nameValue || ''}" autofocus class='w-60p' data-profile-capturer-target='name'>
          </div>
          <div class='footer flex flex-row justify-end'>
            <button class='cancel' data-action='modal#close'>Cancel</button>
            <button class='ok' data-action='profile-capturer#save'>OK</button>
          </div>
        </div>
      </dialog>`);
  }
}
