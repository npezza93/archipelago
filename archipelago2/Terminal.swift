import Cocoa
import Foundation

public class Terminal {
  let readSize = 8 * 1024

  /* The file descriptor used to communicate with the child process */
  public private(set) var childfd: Int32 = -1

  /* The PID of our subprocess */
  public private(set) var shellPid: pid_t = 0
  var debugIO = true

  var loggingDir: String? = nil
  var logFileCounter = 0

  /* number of sent requests */
  var sendCount = 0
  var total = 0

  var delegate: PtyDelegate?

  // Queue used to send the data received from the local process
  var dispatchQueue: DispatchQueue

  // The queue we use to read, it feels more interactive if we
  // read here and then post to the main thread.   Otherwise it feels
  // chunky.
  var readQueue: DispatchQueue

  var io: DispatchIO?

  var childMonitor: DispatchSourceProcess?

  var totalRead = 0

  public init(delegate: PtyDelegate, dispatchQueue: DispatchQueue? = nil) {
    self.delegate = delegate
    self.dispatchQueue = dispatchQueue ?? DispatchQueue.main
    self.readQueue = DispatchQueue(label: "sender")
  }

  func getEnvironment() -> [String] {
    var l: [String] = []
    let t = "xterm-256color"
    l.append("TERM=\(t)")
    l.append("COLORTERM=truecolor")

    // Without this, tools like "vi" produce sequences that are not UTF-8 friendly
    l.append("LANG=en_US.UTF-8")
    let env = ProcessInfo.processInfo.environment
    for x in ["LOGNAME", "USER", "DISPLAY", "LC_TYPE", "USER", "HOME" /* "PATH" */] {
      if env.keys.contains(x) {
        l.append("\(x)=\(env[x]!)")
      }
    }
    return l
  }

  public func spawn(
    size: inout winsize, executable: String = "/bin/bash", args: [String] = [],
    execName: String? = nil
  ) {
    var shellArgs = args
    if let firstArgName = execName {
      shellArgs.insert(firstArgName, at: 0)
    } else {
      shellArgs.insert(executable, at: 0)
    }

    if let (shellPid, childfd) = PtyHelpers.fork(
      andExec: executable, args: shellArgs, env: self.getEnvironment(), desiredWindowSize: &size)
    {
      childMonitor = DispatchSource.makeProcessSource(
        identifier: shellPid, eventMask: .exit, queue: dispatchQueue)
      if let cm = childMonitor {
        cm.activate()
        cm.setEventHandler(handler: { [weak self] in self?.processTerminated() })
      }

      self.childfd = childfd
      self.shellPid = shellPid
      io = DispatchIO(
        type: .stream, fileDescriptor: childfd, queue: dispatchQueue, cleanupHandler: { x in })
      guard let io else {
        return
      }
      io.setLimit(lowWater: 1)
      io.setLimit(highWater: readSize)
      io.read(offset: 0, length: readSize, queue: readQueue, ioHandler: childProcessRead)
    }
  }

  public func send(data: ArraySlice<UInt8>) {
    let copy = sendCount
    sendCount += 1
    data.withUnsafeBytes { ptr in
      let ddata = DispatchData(bytes: ptr)
      let copyCount = ddata.count
      if debugIO {
        print("[SEND-\(copy)] Queuing data to client: \(data) ")
      }

      DispatchIO.write(
        toFileDescriptor: childfd, data: ddata,
        runningHandlerOn: DispatchQueue.global(qos: .userInitiated),
        handler: { dd, errno in
          self.total += copyCount
          if self.debugIO {
            print("[SEND-\(copy)] completed bytes=\(self.total)")
          }
          if errno != 0 {
            print("Error writing data to the child, errno=\(errno)")
          }
        })
    }
  }

  func childProcessRead(done: Bool, data: DispatchData?, errno: Int32) {
    guard let data else {
      return
    }
    if debugIO {
      totalRead += data.count
      print("[READ] count=\(data.count) received from host total=\(totalRead)")
    }

    if data.count == 0 {
      childfd = -1
      return
    }
    var b: [UInt8] = Array.init(repeating: 0, count: data.count)
    b.withUnsafeMutableBufferPointer({ ptr in
      let _ = data.copyBytes(to: ptr)
      if let dir = loggingDir {
        let path = dir + "/log-\(logFileCounter)"
        do {
          let dataCopy = Data(ptr)
          try dataCopy.write(to: URL.init(fileURLWithPath: path))
          logFileCounter += 1
        } catch {
          // Ignore write error
          print("Got error while logging data dump to \(path): \(error)")
        }
      }
    })
    dispatchQueue.sync {
      delegate?.dataReceived(slice: b[...])
    }
    io?.read(offset: 0, length: readSize, queue: readQueue, ioHandler: childProcessRead)
  }

  func processTerminated() {
    var n: Int32 = 0
    waitpid(shellPid, &n, WNOHANG)
    delegate?.processTerminated(self, exitCode: n)
  }

  public func terminate() {
    kill(shellPid, SIGKILL)
  }
}
