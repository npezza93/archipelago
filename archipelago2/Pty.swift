import Darwin
import Foundation

class Pty {
  var process: Process
  var slave: FileHandle?
  var master: FileHandle
  var masterFD: Int32
  var slaveFD: Int32

  public init(onDataReceived: @escaping (Data) -> Void) {
    self.process = Process()
    process.launchPath = App.activeProfile().shell
    process.arguments = App.activeProfile().parsedShellArgs()

    self.masterFD = posix_openpt(O_RDWR | O_NOCTTY)

    if self.masterFD == -1 {
      fatalError("posix_openpt failed: \(String(cString: strerror(errno)))")
    }

    if grantpt(masterFD) == -1 {
      fatalError("grantpt failed: \(String(cString: strerror(errno)))")
    }

    if unlockpt(masterFD) == -1 {
      fatalError("unlockpt failed: \(String(cString: strerror(errno)))")
    }

    self.master = FileHandle(fileDescriptor: masterFD)
    guard let slavePath = String(cString: ptsname(masterFD), encoding: .utf8) else {
      fatalError("Failed to get slave path")
    }

    self.slaveFD = open(slavePath, O_RDWR | O_NOCTTY)
    if self.slaveFD == -1 {
      fatalError("open failed for \(slavePath): \(String(cString: strerror(errno)))")
    }

    self.slave = FileHandle.init(forUpdatingAtPath: slavePath)

    self.process.standardOutput = FileHandle(fileDescriptor: slaveFD, closeOnDealloc: true)
    self.process.standardInput = FileHandle(fileDescriptor: slaveFD, closeOnDealloc: true)
    self.process.standardError = FileHandle(fileDescriptor: slaveFD, closeOnDealloc: true)

    self.master.readabilityHandler = { handle in
      let data = handle.availableData
      if !data.isEmpty {
        onDataReceived(data)
      }
    }

    var env = ProcessInfo.processInfo.environment
    env["COLORTERM"] = "truecolor"
    env["LANG"] = "en-US.UTF-8"
    env["TERM"] = "screen-256color"
    self.process.environment = env
  }

  public func send(data: Data) {
    self.master.write(data)
  }

  public func spawn() {
    try! self.process.run()
    tcsetpgrp(self.slaveFD, self.process.processIdentifier)
  }

  public func kill() {
    self.process.terminate()
    self.master.readabilityHandler = nil
    self.master.closeFile()
    self.slave?.closeFile()
  }

  public func setSize(cols: UInt16, rows: UInt16) {
    var size = winsize()
    size.ws_col = cols
    size.ws_row = rows

    _ = ioctl(self.masterFD, TIOCSWINSZ, &size)
  }
}
