import Foundation

class PreferenceFile {
  var config: Config
  var changeListeners: [(String, Any) -> Void]
  var nameChangeListeners: [(String) -> Void]

  public init() {
    self.changeListeners = []
    self.nameChangeListeners = []
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

  func createProfile() {
    let profile: Config.Profile = self.config.profiles.max { $0.id < $1.id }!
    let id: UInt32 = profile.id + 1
    var newProfile = Config.Profile()
    newProfile.id = id

    self.config.profiles.append(newProfile)
    self.config.activeProfileId = id
    save()
    notifyNameChangeListeners()
  }

  func destroyProfile() {
    let currentId = activeProfile().id
    let profiles = self.config.profiles.filter { $0.id != currentId }
    config.profiles = profiles
    config.activeProfileId = profiles[0].id
    save()
    notifyNameChangeListeners()
  }

  func updateActiveProfile(id: UInt32) {
    config.activeProfileId = id
    save()
    notifyNameChangeListeners()
  }

  private func notifyNameChangeListeners() {
    for listener in nameChangeListeners {
      listener(asJson())
    }
  }

  func updateName(id: UInt32, name: String) {
    let index = self.config.profiles.firstIndex(where: { $0.id == id }) ?? 0
    var profile = self.config.profiles[index]
    profile.name = name
    self.config.profiles[index] = profile
    save()
    notifyNameChangeListeners()
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
    case "theme.selectionBackground":
      profile.theme.selectionBackground = value as! String
    case "theme.foreground":
      profile.theme.foreground = value as! String
    case "theme.background":
      profile.theme.background = value as! String
    case "theme.black":
      profile.theme.black = value as! String
    case "theme.red":
      profile.theme.red = value as! String
    case "theme.brightRed":
      profile.theme.brightRed = value as! String
    case "theme.green":
      profile.theme.green = value as! String
    case "theme.brightGreen":
      profile.theme.brightGreen = value as! String
    case "theme.yellow":
      profile.theme.yellow = value as! String
    case "theme.brightYellow":
      profile.theme.brightYellow = value as! String
    case "theme.magenta":
      profile.theme.magenta = value as! String
    case "theme.brightMagenta":
      profile.theme.brightMagenta = value as! String
    case "theme.cyan":
      profile.theme.cyan = value as! String
    case "theme.brightCyan":
      profile.theme.brightCyan = value as! String
    case "theme.blue":
      profile.theme.blue = value as! String
    case "theme.brightBlue":
      profile.theme.brightBlue = value as! String
    case "theme.white":
      profile.theme.white = value as! String
    case "theme.brightWhite":
      profile.theme.brightWhite = value as! String
    case "theme.brightBlack":
      profile.theme.brightBlack = value as! String
    case "theme.cursorAccent":
      profile.theme.cursorAccent = value as! String
    case "theme.cursor":
      profile.theme.cursor = value as! String
    case "keybindings":
      profile.keybindings = value as! [Config.Profile.Keybinding]
    default:
      fatalError("property not found")
    }

    self.config.profiles[activeProfileIndex()] = profile
    save()
    for listener in changeListeners {
      if property.starts(with: /theme\./) || property == "keybindings" {
        listener(property, activeProfileJSON())
      } else {
        listener(property, value)
      }
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

  func asJson() -> String {
    do {
      let jsonData = try JSONEncoder().encode(config)

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

  func onNameChange(listener: @escaping (String) -> Void) {
    nameChangeListeners.append(listener)
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
