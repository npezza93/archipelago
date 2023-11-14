import Foundation
import Strada

final class KeybindingActionsComponent: BridgeComponent {
  override class var name: String { "keybinding-actions" }

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
    guard let data: MessageData = message.data() else { return }

    App.preferenceFile.destroyKeybinding(index: data.index)
  }
}

extension KeybindingActionsComponent {
  fileprivate enum Event: String {
    case change
  }

  fileprivate struct MessageData: Decodable {
    let index: Int
  }
}
