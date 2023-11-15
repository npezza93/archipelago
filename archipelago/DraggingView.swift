import Cocoa
import Foundation

class DraggingView: NSView {
  var initialLocation: NSPoint?
  var downEvent: NSEvent?
  private var isDragging = false
  private let dragThreshold: CGFloat = 5.0  // Threshold to differentiate between drag and click

  override func mouseDown(with event: NSEvent) {
    self.initialLocation = event.locationInWindow
    self.downEvent = event
    isDragging = false
  }

  override func mouseDragged(with event: NSEvent) {
    guard let initialLocation = initialLocation, let window = self.window else { return }

    let currentLocation = window.frame.origin
    let newOrigin = NSPoint(
      x: currentLocation.x + (event.locationInWindow.x - initialLocation.x),
      y: currentLocation.y + (event.locationInWindow.y - initialLocation.y))

    window.setFrameOrigin(newOrigin)
    if abs(event.locationInWindow.x - initialLocation.x) > dragThreshold
      || abs(event.locationInWindow.y - initialLocation.y) > dragThreshold
    {
      isDragging = true
    }

  }

  override func mouseUp(with event: NSEvent) {
    if !isDragging {
      // It's a click, not a drag
      if let down = downEvent {
        passEventToNextResponder(down)
      }
      passEventToNextResponder(event)
      self.downEvent = nil
    }
    isDragging = false
  }

  private func passEventToNextResponder(_ event: NSEvent) {
    // Forward the event to the next responder or directly to underlying views
    // Adjust this method based on your app's specific view hierarchy
    nextResponder?.mouseDown(with: event)
  }
}
