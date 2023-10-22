import Foundation

class Pty {
  var stdout: Pipe
  var stdin: Pipe
  var process: Process

  public init(onDataReceived: @escaping (String) -> Void) {
    self.process = Process()
    process.launchPath = "/usr/bin/env"
    process.arguments = ["/bin/zsh"]

    self.stdout = Pipe()
    self.process.standardOutput = self.stdout

    self.stdin = Pipe()
    self.process.standardInput = self.stdin

    self.stdout.fileHandleForReading.readabilityHandler = { handle in
      onDataReceived(handle.availableData.base64EncodedString())
    }
  }

  public func send(data: Data) {
      self.stdin.fileHandleForWriting.write(data)
  }

  public func spawn(cols: UInt16, rows: UInt16) {
    self.process.launch()
    self.setSize(cols: cols, rows: rows)
  }

  public func kill() {
    self.process.terminate()
    self.stdout.fileHandleForReading.readabilityHandler = nil
  }

  public func setSize(cols: UInt16, rows: UInt16) {
    var size = winsize()
    size.ws_col = cols
    size.ws_row = rows

    _ = ioctl(process.processIdentifier, TIOCSWINSZ, &size)
  }
}
