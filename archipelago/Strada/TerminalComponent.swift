import Foundation
import Strada

final class TerminalComponent: BridgeComponent {
  override class var name: String { "terminal" }
  var settingChangeListener: SettingChangeListenerWrapper?
  var profileChangeListeners: [ProfileChangeListenerWrapper]?
  var terminal: Pty!

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .connect:
      handleConnectEvent()
    case .data:
      handleDataEvent()
    case .disconnect:
      self.terminal?.kill()
    case .write:
      handleWriteEvent(message: message)
    case .resize:
      handleResizeEvent(message: message)
    case .profileChanged:
      addProfileListener(id: message.id)
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

  private func handleConnectEvent() {
    let message = Message(
      id: "connect", component: "terminal", event: "connect",
      metadata: Message.Metadata(url: ""),
      jsonData: App.preferenceFile.activeProfileJSON())
    self.settingChangeListener = App.preferenceFile.onChange(listener: onSettingChanged)
    reply(with: message)
  }

  private func handleDataEvent() {
    self.terminal = Pty(onDataReceived: dataReceived, onProcessTerminated: closeWindow)
    terminal.spawn()
  }

  private func handleWriteEvent(message: Message) {
    guard let data: MessageData = message.data() else { return }
    if let data = data.data.data(using: .utf8) {
      self.terminal.send(data: data)
    } else {
      print("bad conversion")
    }
  }

  private func handleResizeEvent(message: Message) {
    guard let data: ResizeMessageData = message.data() else { return }

    self.terminal.setSize(cols: data.cols, rows: data.rows)
  }

  private func dataReceived(data: Data) {
    let uint8Array: [UInt8] = Array(data)
    let json = """
          {"data":"\(uint8Array)"}
      """
    let message = Message(
      id: "data", component: "terminal", event: "data", metadata: Message.Metadata(url: ""),
      jsonData: json)

    Task { try await reply(with: message) }
  }

  private func closeWindow() {
    delegate.webView?.window?.close()
  }

  private func onSettingChanged(property: String, value: Any) {
    var json = ""
    if property.starts(with: /theme\./) || property == "keybindings" {
      json = """
            {"property":"\(property)","value":\(value)}
        """
    } else {
      json = """
            {"property":"\(property)","value":"\(value)"}
        """
    }

    reply(to: "settingChanged", with: json)
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
      wrappers.forEach {
        let message = Message(
          id: $0.id, component: type(of: self).name, event: "profileChanged",
          metadata: Message.Metadata(url: ""),
          jsonData: profile)
        reply(with: message)
      }
    }
  }
}

// MARK: Events

extension TerminalComponent {
  fileprivate enum Event: String {
    case connect
    case data
    case disconnect
    case write
    case resize
    case profileChanged
  }
}

// MARK: Message data

extension TerminalComponent {
  fileprivate struct MessageData: Decodable {
    let data: String
  }

  fileprivate struct ResizeMessageData: Decodable {
    let cols: UInt16
    let rows: UInt16
  }
}
