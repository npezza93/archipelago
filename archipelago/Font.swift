import CoreText
import Foundation

class Font: Codable {

  var path: String
  var name: String
  var format: String

  var raw: [UInt8]?
  var base64: String?

  public init(name: String, path: String) {
    self.name = name
    self.path = path

    if path.hasSuffix(".ttf") {
      self.format = "truetype"
    } else if path.hasSuffix(".otf") {
      self.format = "opentype"
    } else if path.hasSuffix(".ttc") {
      self.format = "collection"
    } else if path.hasSuffix(".woff") {
      self.format = "woff"
    } else if path.hasSuffix(".woff2") {
      self.format = "woff2"
    } else {
      self.format = "truetype"
    }
  }

  func fetchRaw() {
    if self.raw == nil {
      let data = try! Data(contentsOf: URL(fileURLWithPath: path))
      self.raw = [UInt8](data)
      self.base64 = data.base64EncodedString()
    }
  }

  func as_json() -> String {
    do {
      self.fetchRaw()
      let jsonData = try JSONEncoder().encode(self)

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
