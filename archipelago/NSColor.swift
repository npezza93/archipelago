import AppKit
import Foundation

extension NSColor {

  convenience init?(string: String) {
    // Hex string
    if string.hasPrefix("#") {
      let hex = string.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
      var int: UInt64 = 0
      Scanner(string: hex).scanHexInt64(&int)
      let a: UInt64
      let r: UInt64
      let g: UInt64
      let b: UInt64
      switch hex.count {
      case 3:  // RGB (12-bit)
        (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
      case 6:  // RGB (24-bit)
        (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
      case 8:  // ARGB (32-bit)
        (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
      default:
        return nil
      }
      self.init(
        red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255,
        alpha: CGFloat(a) / 255)
      return
    }

    // RGB or RGBA string
    let components = string.trimmingCharacters(in: CharacterSet(charactersIn: "rgb(a)"))
      .components(separatedBy: ",")
      .compactMap {
        CGFloat((Double($0.trimmingCharacters(in: .whitespacesAndNewlines)) ?? 0.0) / 255.0)
      }

    switch components.count {
    case 3:
      self.init(red: components[0], green: components[1], blue: components[2], alpha: 1.0)
    case 4:
      self.init(red: components[0], green: components[1], blue: components[2], alpha: components[3])
    default:
      return nil
    }
  }
}
