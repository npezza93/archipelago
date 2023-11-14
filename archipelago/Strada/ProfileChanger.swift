import Foundation
import Strada

class ProfileChanger: BridgeComponent {
  var changeListeners: [ProfileChangeListenerWrapper]?

  override func onViewWillDisappear() {
    if let wrappers = self.changeListeners {
      wrappers.forEach { App.preferenceFile.removeProfileChange(wrapper: $0) }
    }
  }

  func addListener(id: String) {
    if let wrappers = self.changeListeners {
      self.changeListeners =
        wrappers + [App.preferenceFile.onProfileChange(id: id, listener: onProfileChanged)]
    } else {
      self.changeListeners = [
        App.preferenceFile.onProfileChange(id: id, listener: onProfileChanged)
      ]
    }
  }

  func onProfileChanged(profile: String) {
    if let wrappers = self.changeListeners {
      wrappers.forEach {
        let message = Message(
          id: $0.id, component: type(of: self).name, event: "connect",
          metadata: Message.Metadata(url: ""),
          jsonData: profile)
        reply(with: message)
      }
    }
  }
}
