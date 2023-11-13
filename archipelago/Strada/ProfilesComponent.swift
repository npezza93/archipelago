import Foundation
import Strada

final class ProfilesComponent: BridgeComponent {
  override class var name: String { "profiles" }

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .change:
      handleChangeEvent(message)
    }
  }

  private func handleChangeEvent(_ message: Message) {
    let message = Message(
      id: message.id, component: "profiles", event: "change",
      metadata: Message.Metadata(url: ""),
      jsonData: App.preferenceFile.asJson())
    App.preferenceFile.onNameChange(listener: onNameChanged)
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
