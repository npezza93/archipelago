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
      handleConnectEvent(message: message)
    case .disconnect:
      self.terminal?.kill()
    case .write:
      handleWriteEvent(message: message)
    case .binary:
      handleBinaryEvent(message: message)
    }
  }

  func sendData(_ message: String) {
  }

  // MARK: Private

  private func handleConnectEvent(message: Message) {
    guard let data: ConnectMessageData = message.data() else { return }

    self.terminal = Pty() { data in
        print(data)
    }
    terminal.spawn(cols: data.cols, rows: data.rows)
  }

  private func handleWriteEvent(message: Message) {
    guard let data: MessageData = message.data() else { return }
    if let data = data.data.data(using: .utf8) {
      self.terminal.send(data: data)
    } else {
      print("bad conversion")
    }
  }

  private func handleBinaryEvent(message: Message) {
    guard let data: MessageData = message.data() else { return }
  }

  func processTerminated(_ source: Terminal, exitCode: Int32?) {
  }

  func dataReceived(data: String) {
    let json = """
          {"data":"\(data)"}
      """
    let message = Message(
      id: "1", component: "data-bridge", event: "connect", metadata: Message.Metadata(url: ""),
      jsonData: json)
    reply(with: message)
  }
}

// MARK: Events

extension TerminalComponent {
  fileprivate enum Event: String {
    case connect
    case disconnect
    case write
    case binary
  }
}

// MARK: Message data

extension TerminalComponent {
  fileprivate struct MessageData: Decodable {
    let data: String
  }

  fileprivate struct ConnectMessageData: Decodable {
    let cols: UInt16
    let rows: UInt16
  }

}
