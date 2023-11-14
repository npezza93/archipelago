import Foundation
import Strada

final class ProfilesComponent: BridgeComponent {
  override class var name: String { "profiles" }
  var nameChangeListener: NameChangeListenerWrapper?

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .change:
      handleChangeEvent(message)
    }
  }

  override func onViewWillDisappear() {
    if let wrapper = self.nameChangeListener {
      App.preferenceFile.removeNameChange(wrapper: wrapper)
    }
  }

  private func handleChangeEvent(_ message: Message) {
    let message = Message(
      id: message.id, component: "profiles", event: "change",
      metadata: Message.Metadata(url: ""),
      jsonData: App.preferenceFile.asJson())
    self.nameChangeListener = App.preferenceFile.onNameChange(listener: onNameChanged)
    reply(with: message)
  }

  private func onNameChanged(preferenceFile: String) {
    reply(to: "change", with: preferenceFile)
  }
}

extension ProfilesComponent {
  fileprivate enum Event: String {
    case change
  }
}
