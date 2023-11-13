import Foundation
import Strada

final class ProfileComponent: BridgeComponent {
  override class var name: String { "profile" }

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

    App.preferenceFile.updateActiveProfile(id: data.id)
  }
}

extension ProfileComponent {
  fileprivate enum Event: String {
    case change
  }

  fileprivate struct MessageData: Decodable {
    let id: UInt32
  }
}
