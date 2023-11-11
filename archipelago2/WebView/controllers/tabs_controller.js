import { BridgeComponent } from "@hotwired/strada"

export default class extends BridgeComponent {
  static component = "tabs"

  connect() {
    super.connect()
    this.selectTab(document.querySelector('.heading[data-value="text"]'));
  }

  change(event) {
    this.selectTab(event.target.closest('.heading'));
  }

  selectTab(tab) {
    document.querySelector('.heading.active')?.classList?.remove('active');
    document.querySelector('section:not(.hidden)')?.classList?.add('hidden');
    tab.classList.toggle('active');
    const section = document.querySelector(`section#${tab.dataset.value}`);

    if (section) {
      section.classList.remove('hidden');
      this.send("resize", {
        height: document.body.offsetHeight,
      })
    }
  }
}
