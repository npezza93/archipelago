import CoreText
import Foundation

class Font {

  var paths: [String]
  var name: String

  public init(name: String) {
    self.name = name
    self.paths = []
  }

  func addPath(_ path: String) {
    self.paths.append(path)
  }

  func format() -> String {
    let path = findPath()

    if path.hasSuffix(".ttf") {
      return "truetype"
    } else if path.hasSuffix(".otf") {
      return "opentype"
    } else if path.hasSuffix(".ttc") {
      return "collection"
    } else if path.hasSuffix(".woff") {
      return "woff"
    } else if path.hasSuffix(".woff2") {
      return "woff2"
    } else {
      return "truetype"
    }
  }

  func findPath() -> String {
    paths.filter { !$0.lowercased().contains("italic") && !$0.lowercased().contains("bold") }
      .first { $0.lowercased().contains("regular") } ?? paths[0]
  }

  func as_json() -> String {
    do {
      let data = try! Data(contentsOf: URL(fileURLWithPath: findPath()))

      let json = FontJson(
        name: name, path: findPath(), raw: [UInt8](data),
        base64: data.base64EncodedString()
      )

      let jsonData = try JSONEncoder().encode(json)

      if let jsonString = String(data: jsonData, encoding: .utf8) {
        return jsonString
      } else {
        return ""
      }
    } catch {
      return ""
    }
  }
}

struct FontJson: Codable {
  var name: String
  var path: String
  var raw: [UInt8]
  var base64: String
}
