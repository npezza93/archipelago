import CoreText
import Foundation

class Font: Codable {

  var path: String
  var base64: String
  var name: String
  var format: String
  var raw: [UInt8]

  public init(name: String, path: String) {
    self.name = name
    self.path = path

    let data = try! Data(contentsOf: URL(fileURLWithPath: path))

    self.base64 = data.base64EncodedString()
    self.raw = [UInt8](data)
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

  func as_json() -> String {
    do {
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
