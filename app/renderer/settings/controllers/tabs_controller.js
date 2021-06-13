import { Controller } from 'stimulus';
import {ipcRenderer as ipc} from 'electron-better-ipc';

export default class extends Controller {
  connect() {
    this.selectTab(document.querySelector('.heading[data-value="text"]'));
  }

  change(event) {
    this.selectTab(event.target.closest('.heading'));
  }

  selectTab(tab) {
    document.querySelectorAll('.heading').forEach((otherHeading) => {
      otherHeading.classList.remove('active');
    });
    document.querySelectorAll('section').forEach((section) => {
      section.classList.add('hidden');
    });
    tab.classList.toggle('active');
    const section = document.querySelector(`section#${tab.dataset.value}`)

    if (section) {
      section.classList.remove('hidden');
      ipc.callMain('resize', {
        width: document.body.offsetWidth,
        height: document.body.offsetHeight
      });
    }
  }
}
