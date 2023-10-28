import Foundation

class PreferenceFile {
  var config: Config

  public init() {
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
