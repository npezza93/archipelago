import Foundation
import Strada

final class KeybindingsComponent: ProfileChanger {
  override class var name: String { "keybindings" }
  var settingChangeListener: SettingChangeListenerWrapper?

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .connect:
      handleConnectEvent(message)
    }
  }

  override func onViewWillDisappear() {
    super.onViewWillDisappear()
    if let wrapper = self.settingChangeListener {
      App.preferenceFile.removeChange(wrapper: wrapper)
    }
  }

  private func handleConnectEvent(_ message: Message) {
    let message = Message(
      id: message.id, component: "keybindings", event: "connect",
      metadata: Message.Metadata(url: ""),
      jsonData: App.preferenceFile.activeProfileJSON())
    self.settingChangeListener = App.preferenceFile.onChange(listener: onSettingChanged)
    addListener(id: message.id)
    reply(with: message)
  }

  private func onSettingChanged(property: String, value: Any) {
    if property == "keybindings" {
      let json = """
          {"property":"\(property)","value":\(value)}
        """

      reply(to: "keybindingsChanged", with: json)
    }
  }
}

extension KeybindingsComponent {
  fileprivate enum Event: String {
    case connect
  }
}
