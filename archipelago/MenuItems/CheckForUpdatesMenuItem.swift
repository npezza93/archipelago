import Cocoa
import Foundation
import UserNotifications
import ZIPFoundation

class CheckForUpdatesMenuItem: NSMenuItem {
  override init(title string: String, action selector: Selector?, keyEquivalent charCode: String) {
    super.init(title: string, action: selector, keyEquivalent: charCode)
    commonInit()
  }

  required init(coder: NSCoder) {
    super.init(coder: coder)
    commonInit()
  }

  private func commonInit() {
    self.target = self
    self.action = #selector(checkForUpdateAction)
    #if !DEBUG
      perform(#selector(checkForUpdateAction), with: false, afterDelay: 5)
    #endif
  }

  @objc private func checkForUpdateAction(_ clicked: Bool = true) {
    let url = URL(string: "https://api.github.com/repos/npezza93/archipelago/releases?per_page=100")
    let task = URLSession.shared.dataTask(with: url!) { data, response, error in
      if let error = error {
        print("Error: \(error)")
        return
      }
      guard let data = data else {
        print("No data received")
        return
      }

      do {
        if var currentVersion = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") {
          currentVersion = Version("\(currentVersion)")
          let releases =
            try! JSONSerialization.jsonObject(with: data, options: .fragmentsAllowed) as! [Any]
          let viableReleases = releases.map { $0 as! [String: Any] }.filter {
            let prerelease = $0["prerelease"] as! UInt
            let tagName = $0["tag_name"] as! String

            return true
            return prerelease == 0 && Version(tagName) > currentVersion as! Version
          }.sorted {
            Version($0["tag_name"] as! String) > Version($1["tag_name"] as! String)
          }

          if viableReleases.isEmpty {
            self.up_to_date(clicked)
          } else {
            let asset = (viableReleases[0]["assets"] as! [Any]).map { $0 as! [String: Any] }.first {
              ($0["name"] as! String).lowercased() == "archipelago.zip"
            }
            if let asset = asset {
              self.download_and_install(viableReleases[0], asset)
            }
          }
        }
      }
    }

    task.resume()
  }

  private func up_to_date(_ clicked: Bool) {
    if clicked {
      let content = UNMutableNotificationContent()
      content.title = "Up to date!"

      let request = UNNotificationRequest(
        identifier: UUID().uuidString, content: content, trigger: nil)
      UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    } else {
      perform(#selector(checkForUpdateAction), with: false, afterDelay: 3600)
    }
  }

  private func download_and_install(_ release: [String: Any], _ asset: [String: Any]) {
    self.download(asset["browser_download_url"] as! String) {
      DispatchQueue.main.async {
        let alert = NSAlert()
        alert.messageText = release["tag_name"] as! String
        alert.informativeText =
          "A new version has been downloaded. Restart the application to apply the update."
        alert.addButton(withTitle: "Restart")
        alert.addButton(withTitle: "Later")
        let response = alert.runModal()
        switch response {
        case .alertFirstButtonReturn:
          let process = Process()
          let scriptPath = Bundle.main.path(forResource: "updater", ofType: "sh")

          process.executableURL = URL(fileURLWithPath: scriptPath!)

          try! process.run()
        default:
          break
        }
      }
    }
  }

  private func download(_ url: String, completion: @escaping () -> Void) {
    let destinationDir = FileManager.default.urls(
      for: .applicationSupportDirectory, in: .userDomainMask
    ).first!.appendingPathComponent("Archipelago")
    let zip = destinationDir.appendingPathComponent("archipelago-next.zip")

    let task = URLSession.shared.downloadTask(with: URL(string: url)!) {
      location, response, error in
      guard let location = location, error == nil else { return }

      if FileManager.default.fileExists(atPath: zip.path) {
        try! FileManager.default.removeItem(at: zip)
      }
      try! FileManager.default.moveItem(at: location, to: zip)
      try! FileManager.default.removeItem(
        at: destinationDir.appendingPathComponent("Archipelago.app"))
      try! FileManager.default.unzipItem(at: zip, to: destinationDir)
      try! FileManager.default.removeItem(at: zip)
      completion()
    }

    task.resume()

  }
}

class Version: Comparable {
  static func < (lhs: Version, rhs: Version) -> Bool {
    if lhs.major != rhs.major {
      return lhs.major < rhs.major
    }
    if lhs.minor != rhs.minor {
      return lhs.minor < rhs.minor
    }
    return lhs.patch < rhs.patch
  }

  static func == (lhs: Version, rhs: Version) -> Bool {
    lhs.major == rhs.major && lhs.minor == rhs.minor && lhs.patch == rhs.patch
  }

  open var major: Int
  open var minor: Int
  open var patch: Int

  public init(_ version: String) {
    var newVersion = version

    if version.starts(with: "v") {
      newVersion = String(newVersion.dropFirst())
    }
    let parts = newVersion.split(separator: ".")

    self.major = Int(parts[0])!
    self.minor = Int(parts[1])!

    if let index = parts[2].firstIndex(of: "-") {
      self.patch = Int(String(parts[2][..<index]))!
    } else {
      self.patch = Int(parts[2])!
    }
  }
}
