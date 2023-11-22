import Foundation
import Strada

final class FontLoaderComponent: BridgeComponent {
  override class var name: String { "font-loader" }
  var settingChangeListener: SettingChangeListenerWrapper?
  var profileChangeListeners: [ProfileChangeListenerWrapper]?
  var loadedFonts: [String: Set<String>] = [:]

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .load:
      handleLoadEvent(message)
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

  private func handleLoadEvent(_ message: Message) {
    loadedFonts[message.id] = Set([App.preferenceFile.activeProfile().fontFamily])

    addProfileListener(id: message.id)
    self.settingChangeListener = App.preferenceFile.onChange(listener: onSettingChanged)
  }

  private func onSettingChanged(property: String, value: Any) {
    if property == "fontFamily",
      let font = App.fonts.first(where: { $0.name == value as! String })
    {
      guard let message = receivedMessage(for: "load") else { return }
      if !loadedFonts[message.id]!.contains(font.name) {
        reply(to: "load", with: font.as_json())
        loadedFonts[message.id]!.insert(font.name)
      }
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
      if let font = App.fonts.first(where: {
        $0.name == App.preferenceFile.activeProfile().fontFamily
      }) {
        wrappers.forEach {
          if !loadedFonts[$0.id]!.contains(font.name) {
            let message = Message(
              id: $0.id, component: type(of: self).name, event: "load",
              metadata: Message.Metadata(url: ""),
              jsonData: font.as_json())
            reply(with: message)
            loadedFonts[message.id]!.insert(font.name)
          }
        }
      }
    }
  }
}

extension FontLoaderComponent {
  fileprivate enum Event: String {
    case load
  }
}
