import CoreText
import Foundation

class Font {

  var paths: [String]
  var name: String

  var json: String?

  public init(name: String) {
    self.name = name
    self.paths = []
  }

  func addPath(_ path: String) {
    self.paths.append(path)
  }

  func findPath() -> String {
    paths.filter { !$0.lowercased().contains("italic") && !$0.lowercased().contains("bold") }
      .first { $0.lowercased().contains("regular") } ?? paths[0]
  }

  func as_json() -> String {
    do {
      if let jsonString = json {
        return jsonString
      } else {
        let data = try! Data(contentsOf: URL(fileURLWithPath: findPath()))

        let jsonData = try JSONEncoder().encode(["name": name, "raw": data.base64EncodedString()])
        if let jsonString = String(data: jsonData, encoding: .utf8) {
          self.json = jsonString
          return jsonString
        } else {
          self.json = ""
          return ""
        }
      }

    } catch {
      return ""
    }
  }
}
