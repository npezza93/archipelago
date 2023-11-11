import Foundation
import Strada

final class FontsComponent: BridgeComponent {
  override class var name: String { "fonts" }

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
    let json = """
          {"profile":\(App.preferenceFile.activeProfileJSON()),"fonts":\(App.fonts.keys)}
      """

    let message = Message(
      id: message.id, component: "fonts", event: "connect",
      metadata: Message.Metadata(url: ""),
      jsonData: json)
    reply(with: message)
  }

  private func handleChangeEvent(_ message: Message) {
    guard let data: MessageData = message.data() else { return }

    App.preferenceFile.update(property: data.property, value: data.value)
  }
}

extension FontsComponent {
  fileprivate enum Event: String {
    case connect
    case change
  }

  fileprivate struct MessageData: Decodable {
    let property: String
    let value: String
  }
}
