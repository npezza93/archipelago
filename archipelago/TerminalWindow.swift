import Cocoa
import Foundation

class TerminalWindow: NSWindow {
  override init(
    contentRect: NSRect, styleMask style: NSWindow.StyleMask,
    backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool
  ) {
    super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)

    self.backgroundColor = NSColor(string: App.activeProfile().theme.background)
    let customToolbar = NSToolbar()
    self.titleVisibility = .hidden
    self.toolbar = customToolbar

  }
}
