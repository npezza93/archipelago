import Cocoa
import Foundation

class DraggingView: NSView {
  var initialLocation: NSPoint?

  override func mouseDown(with event: NSEvent) {
    self.initialLocation = event.locationInWindow
  }

  override func mouseDragged(with event: NSEvent) {
    guard let initialLocation = initialLocation, let window = self.window else { return }

    let currentLocation = window.frame.origin
    let newOrigin = NSPoint(
      x: currentLocation.x + (event.locationInWindow.x - initialLocation.x),
      y: currentLocation.y + (event.locationInWindow.y - initialLocation.y))

    window.setFrameOrigin(newOrigin)
  }
}
