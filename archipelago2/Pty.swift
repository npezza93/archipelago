import Darwin
import Foundation

class Pty {
  var process: Process
  var slave: FileHandle?
  var master: FileHandle
  var masterFD: Int32

  public init(onDataReceived: @escaping (String) -> Void) {
    self.process = Process()
    process.launchPath = "/usr/bin/env"
    process.arguments = ["/bin/zsh"]

    self.masterFD = posix_openpt(O_RDWR | O_NOCTTY)

    grantpt(masterFD)
    unlockpt(masterFD)

    self.master = FileHandle.init(fileDescriptor: masterFD)
    let slavePath = String.init(cString: ptsname(masterFD))
    self.slave = FileHandle.init(forUpdatingAtPath: slavePath)

    self.process.standardOutput = self.slave
    self.process.standardInput = self.slave
    self.process.standardError = self.slave

    self.master.readabilityHandler = { handle in
      let data = handle.availableData
      if !data.isEmpty {
        onDataReceived(data.base64EncodedString())
      }
    }

    var env = ProcessInfo.processInfo.environment
    env["COLORTERM"] = "truecolor"
    env["LANG"] = "en-US.UTF-8"
    env["TERM"] = "screen-256color"
    self.process.environment = env

    self.setTermiosSettings()
  }

  public func send(data: Data) {
    self.master.write(data)
  }

  public func spawn() {
    try! self.process.run()
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

  func setTermiosSettings() {
    var raw: termios = termios()

    tcgetattr(self.masterFD, &raw)
    raw.c_iflag = UInt(ICRNL) | UInt(IXON) | UInt(IXANY) | UInt(IMAXBEL) | UInt(BRKINT)
    raw.c_iflag |= UInt(IUTF8)
    raw.c_oflag = UInt(OPOST) | UInt(ONLCR)
    raw.c_cflag = UInt(CREAD) | UInt(CS8) | UInt(HUPCL)
    raw.c_lflag =
      UInt(ICANON) | UInt(ISIG) | UInt(IEXTEN) | UInt(ECHO) | UInt(ECHOE) | UInt(ECHOK)
      | UInt(ECHOKE) | UInt(ECHOCTL)
    raw.c_lflag &= ~UInt(ECHO)  // Turn off ECHO
    raw.c_lflag &= ~UInt(ICANON)

    var ccArray = Array(UnsafeBufferPointer(start: &raw.c_cc.0, count: 20))
    ccArray[Int(VEOF)] = 4
    ccArray[Int(VEOL)] = 0xff
    ccArray[Int(VEOL2)] = 0xff
    ccArray[Int(VERASE)] = 0x7f
    ccArray[Int(VWERASE)] = 23
    ccArray[Int(VKILL)] = 21
    ccArray[Int(VREPRINT)] = 18
    ccArray[Int(VINTR)] = 3
    ccArray[Int(VQUIT)] = 0x1c
    ccArray[Int(VSUSP)] = 26
    ccArray[Int(VSTART)] = 17
    ccArray[Int(VSTOP)] = 19
    ccArray[Int(VLNEXT)] = 22
    ccArray[Int(VDISCARD)] = 15
    ccArray[Int(VMIN)] = 1
    ccArray[Int(VTIME)] = 0
    ccArray[Int(VDSUSP)] = 25
    ccArray[Int(VSTATUS)] = 20

    memcpy(&raw.c_cc, ccArray, MemoryLayout.size(ofValue: raw.c_cc))

    cfsetspeed(&raw, UInt(B9600))

    tcsetattr(self.masterFD, TCSAFLUSH, &raw)
  }
}
