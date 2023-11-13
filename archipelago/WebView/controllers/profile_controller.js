import {Controller} from '@hotwired/stimulus';

export default class extends Controller {
  static values = { name: String, id: Number }

  select() {
    document.querySelectorAll('#profiles article > div').forEach(row => {
      row.classList.remove('active');
    });
    this.element.classList.add('active');
    // ipc.callMain('set-active-profile', this.idValue);
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
