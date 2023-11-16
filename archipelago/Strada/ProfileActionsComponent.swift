import Foundation
import Strada

final class ProfileActionsComponent: BridgeComponent {
  override class var name: String { "profile-actions" }

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .create:
      App.preferenceFile.createProfile()
    case .destroy:
      App.preferenceFile.destroyProfile()
    }
  }
}

extension ProfileActionsComponent {
  fileprivate enum Event: String {
    case create
    case destroy
  }
}
