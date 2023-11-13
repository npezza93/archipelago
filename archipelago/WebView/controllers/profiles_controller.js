import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "profiles"

  connect() {
    // ipc.answerMain('active-profile-changed', this.setValue.bind(this));
    // ipc.answerMain('profile-removed', this.setValue.bind(this));

    super.connect()
    this.send("change", {}, ({data}) => {
      this.setValue(data)
    })
  }

  setValue(config) {
    const article = this.element.querySelector('article');
    article.innerHTML = '';

    config.profiles.forEach(profile => {
      article.insertAdjacentHTML('beforeend', `<div data-controller='profile' data-action='click->profile#select dblclick->profile#edit' data-profile-name-value='${profile.name}' data-profile-id-value=${profile.id}>
        <div>${profile.name || 'New Profile'}</div>
      </div>`);
    });
    const active = [...document.querySelectorAll('[data-controller="profile"]')]
      .findIndex(item => item.dataset.profileIdValue == config.activeProfileId);
    const node = document.querySelectorAll('[data-controller="profile"]')[active];
    if (node) {
      node.classList.add('active');
    }
  }
}
