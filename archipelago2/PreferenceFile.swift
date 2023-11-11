import Foundation

class PreferenceFile {
  var config: Config
  var changeListeners: [(String, Any) -> Void]

  public init() {
    self.changeListeners = []
    self.config = try! JSONDecoder().decode(Config.self, from: "{}".data(using: .utf8)!)

    ensureAppSupportDirectoryExists()

    if FileManager.default.fileExists(atPath: path().path) {
      self.config = read()
    } else {
      save()
    }
  }

  func save() {
    let encoder = JSONEncoder()
    encoder.outputFormatting = .prettyPrinted  // This makes the JSON output readable with whitespace. Remove if not needed.

    try! encoder.encode(config).write(to: path())
  }

  func read() -> Config {
    let data = try! Data(contentsOf: path())

    self.config = try! JSONDecoder().decode(Config.self, from: data)
    return config
  }

  func activeProfile() -> Config.Profile {
    let id = self.config.activeProfileId

    return self.config.profiles.first(where: { $0.id == id }) ?? Config.Profile()
  }

  func activeProfileIndex() -> Int {
    let id = self.config.activeProfileId

    return self.config.profiles.firstIndex(where: { $0.id == id }) ?? 0
  }

  func update(property: String, value: Any) {
    var profile = self.config.profiles[activeProfileIndex()]

    switch property {
    case "cursorStyle":
      profile.cursorStyle = value as! String
    case "fontFamily":
      profile.fontFamily = value as! String
    case "fontWeight":
      profile.fontWeight = value as! String
    case "cursorBlink":
      profile.cursorBlink = value as! Bool
    case "copyOnSelect":
      profile.copyOnSelect = value as! Bool
    case "rightClickSelectsWord":
      profile.rightClickSelectsWord = value as! Bool
    case "hideContextMenu":
      profile.hideContextMenu = value as! Bool
    case "macOptionClickForcesSelection":
      profile.macOptionClickForcesSelection = value as! Bool
    case "macOptionIsMeta":
      profile.macOptionIsMeta = value as! Bool
    case "ligatures":
      profile.ligatures = value as! Bool
    case "vibrancy":
      profile.vibrancy = value as? String
    case "fontSize":
      profile.fontSize = value as! UInt32
    case "shell":
      profile.shell = value as! String
    case "shellArgs":
      profile.shellArgs = value as! String
    case "scrollback":
      profile.scrollback = value as! UInt32
    case "padding":
      profile.padding = value as! String
    default:
      fatalError("property not found")
    }

    self.config.profiles[activeProfileIndex()] = profile
    save()
    for listener in changeListeners {
      listener(property, value)
    }
  }

  func activeProfileJSON() -> String {
    do {
      let jsonData = try JSONEncoder().encode(activeProfile())

      if let jsonString = String(data: jsonData, encoding: .utf8) {
        return jsonString
      } else {
        return ""
      }

    } catch {
      return ""
    }
  }

  func onChange(listener: @escaping (String, Any) -> Void) {
    changeListeners.append(listener)
  }

  private func ensureAppSupportDirectoryExists() {
    let directory = path().deletingLastPathComponent()
    if !FileManager.default.fileExists(atPath: directory.path) {
      do {
        try FileManager.default.createDirectory(
          at: directory, withIntermediateDirectories: true, attributes: nil)
      } catch {
        print("Error creating directory: \(error)")
      }
    }
  }

  private func path() -> URL {
    let appSupportDir = FileManager.default.urls(
      for: .applicationSupportDirectory, in: .userDomainMask
    ).first!

    return appSupportDir.appendingPathComponent("Archipelago/config.dev.json")
  }
}
