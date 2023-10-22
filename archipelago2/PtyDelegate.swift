//
//  PtyDelegate.swift
//  Archipelago
//
//  Created by Nick Pezza on 10/16/23.
//

import Foundation

public protocol PtyDelegate {
  /// This method is invoked on the delegate when the process has exited
  /// - Parameter source: the local process that terminated
  /// - Parameter exitCode: the exit code returned by the process, or nil if this was an error caused during the IO reading/writing
  func processTerminated(_ source: Terminal, exitCode: Int32?)

  /// This method is invoked when data has been received from the local process that should be send to the terminal for processing.
  func dataReceived(slice: ArraySlice<UInt8>)

  /// This method should return the window size to report to the local process.
  func getWindowSize() -> winsize
}
