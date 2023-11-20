import CoreText
import Foundation

struct App {
  static var preferenceFile = PreferenceFile()

  static func activeProfile() -> Config.Profile {
    return preferenceFile.activeProfile()
  }

  static var fonts: [Font] = {
    var fontDict: [String: Font] = [:]

    let fontCollection = CTFontCollectionCreateFromAvailableFonts(nil)
    let matchingFonts: [CTFontDescriptor] =
      CTFontCollectionCreateMatchingFontDescriptors(fontCollection) as! [CTFontDescriptor]

    for fontDescriptor in matchingFonts {
      let font = CTFontCreateWithFontDescriptor(fontDescriptor, 0, nil)
      if let familyName = CTFontCopyFamilyName(font) as String?,
        CTFontGetSymbolicTraits(font).contains(.traitMonoSpace)
          || familyName.lowercased().contains("mono"),
        let url = CTFontDescriptorCopyAttribute(fontDescriptor, kCTFontURLAttribute) as? URL
      {
        fontDict[familyName] = fontDict[familyName] ?? Font(name: familyName)
        fontDict[familyName]?.addPath(url.path)
      }
    }

    return Array(fontDict.values)
  }()
}
