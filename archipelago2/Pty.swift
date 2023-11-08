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
    env["TERM"] = "xterm-256color"
    self.process.environment = env
  }

  public func send(data: Data) {
    let byteArray = [UInt8](data)

    let arraySlice: ArraySlice<UInt8> = byteArray[byteArray.startIndex..<byteArray.endIndex]

    arraySlice.withUnsafeBytes { ptr in
      let ddata = DispatchData(bytes: ptr)

      DispatchIO.write(
        toFileDescriptor: masterFD, data: ddata,
        runningHandlerOn: DispatchQueue.global(qos: .userInitiated),
        handler: { dd, errno in
          if errno != 0 {
            print("Error writing data to the child, errno=\(errno)")
          }
        })
    }
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

  public func fork(andExec: String, args: [String], env: [String]) -> (pid: pid_t, masterFd: Int32)?
  {
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
