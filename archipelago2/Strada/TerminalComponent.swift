import Foundation
import Strada

final class TerminalComponent: BridgeComponent {
  override class var name: String { "terminal" }
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
    case .binary:
      handleBinaryEvent(message: message)
    case .resize:
      handleResizeEvent(message: message)
    }
  }

  private func handleConnectEvent() {
    let message = Message(
      id: "connect", component: "terminal", event: "connect",
      metadata: Message.Metadata(url: ""),
      jsonData: App.preferenceFile.activeProfileJSON())
    reply(with: message)
  }

  private func handleDataEvent() {
    self.terminal = Pty(onDataReceived: dataReceived)
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

  private func handleBinaryEvent(message: Message) {
    guard let data: MessageData = message.data() else { return }
  }

  private func dataReceived(data: Data) {
    let uint8Array: [UInt8] = Array(data)
    let json = """
          {"data":"\(uint8Array)"}
      """
    let message = Message(
      id: "data", component: "terminal", event: "data", metadata: Message.Metadata(url: ""),
      jsonData: json)
    reply(with: message)
  }
}

// MARK: Events

extension TerminalComponent {
  fileprivate enum Event: String {
    case connect
    case data
    case disconnect
    case write
    case binary
    case resize
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
