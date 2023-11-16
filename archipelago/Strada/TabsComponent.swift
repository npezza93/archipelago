import AppKit
import Foundation
import Strada

final class TabsComponent: BridgeComponent {
  override class var name: String { "tabs" }

  override func onReceive(message: Message) {
    guard let event = Event(rawValue: message.event) else {
      return
    }

    switch event {
    case .resize:
      handleResizeEvent(message: message)
    }
  }

  // MARK: Private

  private func handleResizeEvent(message: Message) {
    guard let data: MessageData = message.data() else { return }
    if let webView = delegate.webView {
      let height = CGFloat(data.height)
      if let window = webView.window {
        var frame = webView.frame
        frame.origin.x = window.frame.origin.x
        frame.origin.y = window.frame.origin.y + (window.frame.height - height)
        frame.size.height = height

        window.animator().setFrame(frame, display: true, animate: true)
      }
    }
  }
}

// MARK: Events

extension TabsComponent {
  fileprivate enum Event: String {
    case resize
  }
}

// MARK: Message data

extension TabsComponent {
  fileprivate struct MessageData: Decodable {
    let height: Int
  }
}
