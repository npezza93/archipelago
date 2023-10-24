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

  send(event, data = {}, callback) {
    // Include the url with each message, so the native app can
    // ensure messages are delivered to the correct destination
    data.metadata = { url: "archipelago-1" }

    const message = { component: this.component, event, data, callback }
    const messageId = this.bridge.send(message)
    if (callback) {
      // Track messages that we have callbacks for so we can clean up when disconnected
      this.pendingMessageCallbacks.push(messageId)
    }
  }
}
