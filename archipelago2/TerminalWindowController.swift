//
//  TerminalWindowController.swift
//  archipelago2
//
//  Created by Nick Pezza on 10/25/23.
//

import Cocoa
import Foundation

class TerminalWindowController: NSWindow {
  override init(
    contentRect: NSRect, styleMask style: NSWindow.StyleMask,
    backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool
  ) {
    super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)

    self.backgroundColor = NSColor(string: App.activeProfile().theme.background)
  }
}
