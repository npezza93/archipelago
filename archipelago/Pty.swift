import Darwin
import Foundation

class Pty {
  var childMonitor: DispatchSourceProcess?
  var dispatchQueue: DispatchQueue
  var readQueue: DispatchQueue
  public private(set) var pid: pid_t = 0
  var io: DispatchIO?
  public private(set) var slaveFD: Int32 = -1
  var slave: FileHandle?

  var onDataReceived: (Data) -> Void
  var onProcessTerminated: (() -> Void)?

  public init(onDataReceived: @escaping (Data) -> Void, onProcessTerminated: @escaping () -> Void) {
    self.onDataReceived = onDataReceived
    self.onProcessTerminated = onProcessTerminated
    self.dispatchQueue = DispatchQueue.main
    self.readQueue = DispatchQueue(label: "sender")
  }

  public func send(data: Data) {
    self.slave?.write(data)
  }

  public func spawn() {
    let fileManager = FileManager.default
    let homeDirectory = fileManager.homeDirectoryForCurrentUser
    fileManager.changeCurrentDirectoryPath(homeDirectory.path)

    guard
      let (pid, slaveFD) = fork(
        andExec: App.activeProfile().shell, args: App.activeProfile().parsedShellArgs(),
        env: getEnvironment())
    else { fatalError("failed to create shell") }

    self.childMonitor = DispatchSource.makeProcessSource(
      identifier: pid, eventMask: .exit, queue: dispatchQueue)
    childMonitor?.activate()
    childMonitor?.setEventHandler(handler: { [weak self] in
      self?.childMonitor?.cancel()
      self?.processTerminated()
    })

    self.slaveFD = slaveFD
    self.pid = pid
    self.slave = FileHandle(fileDescriptor: slaveFD)
    self.slave?.readabilityHandler = { handle in
      let data = handle.availableData
      if !data.isEmpty {
        self.onDataReceived(data)
      }
    }
  }

  public func processTerminated() {
    self.slave?.closeFile()  // Close the file handle
    onProcessTerminated?()
  }

  public func kill() {
    Darwin.kill(pid, SIGTERM)
  }

  public func setSize(cols: UInt16, rows: UInt16) {
    var size = winsize()
    size.ws_col = cols
    size.ws_row = rows

    _ = ioctl(self.slaveFD, TIOCSWINSZ, &size)
  }

  private func getEnvironment() -> [String] {
    var env = ProcessInfo.processInfo.environment
    env["COLORTERM"] = "truecolor"
    env["LANG"] = "en-US.UTF-8"
    env["TERM"] = "xterm-256color"

    return env.map { key, value in "\(key)=\(value)" }
  }

  private func fork(andExec: String, args: [String], env: [String]) -> (
    pid: pid_t, masterFd: Int32
  )? {
    var master: Int32 = 0
    var winsize = winsize()

    let pid = forkpty(&master, nil, nil, &winsize)
    if pid < 0 {
      return nil
    }
    if pid == 0 {
      withArrayOfCStrings(
        args,
        { pargs in
          withArrayOfCStrings(
            env,
            { penv in
              let _ = execve(andExec, pargs, penv)
            })
        })
    }
    return (pid, master)
  }

  private func scan<
    S: Sequence, U
  >(_ seq: S, _ initial: U, _ combine: (U, S.Element) -> U) -> [U] {
    var result: [U] = []
    result.reserveCapacity(seq.underestimatedCount)
    var runningResult = initial
    for element in seq {
      runningResult = combine(runningResult, element)
      result.append(runningResult)
    }
    return result
  }

  private func withArrayOfCStrings<R>(
    _ args: [String], _ body: ([UnsafeMutablePointer<CChar>?]) -> R
  ) -> R {
    let argsCounts = Array(args.map { $0.utf8.count + 1 })
    let argsOffsets = [0] + scan(argsCounts, 0, +)
    let argsBufferSize = argsOffsets.last!
    var argsBuffer: [UInt8] = []
    argsBuffer.reserveCapacity(argsBufferSize)
    for arg in args {
      argsBuffer.append(contentsOf: arg.utf8)
      argsBuffer.append(0)
    }
    return argsBuffer.withUnsafeMutableBufferPointer {
      (argsBuffer) in
      let ptr = UnsafeMutableRawPointer(argsBuffer.baseAddress!).bindMemory(
        to: CChar.self, capacity: argsBuffer.count)
      var cStrings: [UnsafeMutablePointer<CChar>?] = argsOffsets.map { ptr + $0 }
      cStrings[cStrings.count - 1] = nil
      return body(cStrings)
    }
  }
}
