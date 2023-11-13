import Foundation
import Strada

final class KeybindingActionsComponent: BridgeComponent {
  override class var name: String { "keybinding-actions" }

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .connect:
      handleConnectEvent(message)
    case .change:
      handleChangeEvent(message)
    }
  }

  private func handleConnectEvent(_ message: Message) {
    let message = Message(
      id: message.id, component: "keybinding-actions", event: "connect",
      metadata: Message.Metadata(url: ""),
      jsonData: App.preferenceFile.activeProfileJSON())
    reply(with: message)
  }

  private func handleChangeEvent(_ message: Message) {
    guard let data: MessageData = message.data() else { return }

    App.preferenceFile.update(property: data.property, value: data.value)
  }
}

extension KeybindingActionsComponent {
  fileprivate enum Event: String {
    case connect
    case change
  }

  fileprivate struct MessageData: Decodable {
    let property: String
    let value: [Config.Profile.Keybinding]
  }
}
