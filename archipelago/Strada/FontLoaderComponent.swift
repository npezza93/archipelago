import Foundation
import Strada

final class FontLoaderComponent: BridgeComponent {
  override class var name: String { "font-loader" }
  var settingChangeListener: SettingChangeListenerWrapper?
  var profileChangeListeners: [ProfileChangeListenerWrapper]?

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
    if let wrapper = self.settingChangeListener {
      App.preferenceFile.removeChange(wrapper: wrapper)
    }
    if let wrappers = self.profileChangeListeners {
      wrappers.forEach { App.preferenceFile.removeProfileChange(wrapper: $0) }
    }
  }

  private func handleChangeEvent(_ message: Message) {
    addProfileListener(id: message.id)
    self.settingChangeListener = App.preferenceFile.onChange(listener: onSettingChanged)
  }

  private func onSettingChanged(property: String, value: Any) {
    if property == "fontFamily", let font = App.fonts.first(where: { $0.name == value as! String }) {
      reply(to: "change", with: font.as_json())
    }
  }

  private func addProfileListener(id: String) {
    if let wrappers = self.profileChangeListeners {
      self.profileChangeListeners =
        wrappers + [App.preferenceFile.onProfileChange(id: id, listener: onProfileChanged)]
    } else {
      self.profileChangeListeners = [
        App.preferenceFile.onProfileChange(id: id, listener: onProfileChanged)
      ]
    }
  }

  private func onProfileChanged(profile: String) {
    if let wrappers = self.profileChangeListeners {
      if let font = App.fonts.first(where: { $0.name == App.preferenceFile.activeProfile().fontFamily }) {
        wrappers.forEach {
          let message = Message(
            id: $0.id, component: type(of: self).name, event: "change",
            metadata: Message.Metadata(url: ""),
            jsonData: font.as_json())
          reply(with: message)
        }
      }
    }
  }
}

extension FontLoaderComponent {
  fileprivate enum Event: String {
    case change
  }
}
