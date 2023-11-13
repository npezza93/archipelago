import CoreText
import Foundation

struct App {
  static var preferenceFile = PreferenceFile()

  static func activeProfile() -> Config.Profile {
    return preferenceFile.activeProfile()
  }

  static var fonts: [String: String] = {
    var fontDict: [String: String] = [:]

    let fontCollection = CTFontCollectionCreateFromAvailableFonts(nil)
    let matchingFonts: [CTFontDescriptor] =
      CTFontCollectionCreateMatchingFontDescriptors(fontCollection) as! [CTFontDescriptor]

    for fontDescriptor in matchingFonts {
      let font = CTFontCreateWithFontDescriptor(fontDescriptor, 0, nil)
      if let familyName = CTFontCopyFamilyName(font) as String? {
        if CTFontGetSymbolicTraits(font).contains(.traitMonoSpace)
          || familyName.lowercased().contains("mono"),
          let url = CTFontDescriptorCopyAttribute(fontDescriptor, kCTFontURLAttribute) as? URL
        {
          fontDict[familyName] = url.path
        }
      }
    }

    return fontDict
  }()
}
