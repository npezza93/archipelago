import Foundation

struct Config: Codable {
  var activeProfileId: UInt32
  var version: String
  var profiles: [Profile]

  public init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)

    self.activeProfileId = try container.decodeIfPresent(UInt32.self, forKey: .activeProfileId) ?? 1
    self.version =
      try container.decodeIfPresent(String.self, forKey: .version) ?? Bundle.main.object(
        forInfoDictionaryKey: "CFBundleVersion") as! String
    self.profiles = try container.decodeIfPresent([Profile].self, forKey: .profiles) ?? [Profile()]
  }

  struct Profile: Codable {
    var id: UInt32
    var fontFamily: String
    var fontSize: UInt32
    var fontWeight: String
    var name: String
    var cursorBlink: Bool
    var cursorStyle: String
    var shell: String
    var shellArgs: String
    var scrollback: UInt32
    var padding: String
    var copyOnSelect: Bool
    var macOptionIsMeta: Bool
    var hideContextMenu: Bool
    var rightClickSelectsWord: Bool
    var macOptionClickForcesSelection: Bool
    var vibrancy: String?
    var ligatures: Bool
    var theme: Theme
    var keybindings: [Keybinding]?

    enum FontSizeValue: Decodable {
      case int(UInt32)

      init(from decoder: Decoder) throws {
        if let intValue = try? decoder.singleValueContainer().decode(UInt32.self) {
          self = .int(intValue)
          return
        }

        if let stringValue = try? decoder.singleValueContainer().decode(String.self) {
          self = .int(UInt32(stringValue)!)
          return
        }

        throw DecodingError.dataCorruptedError(
          in: try decoder.singleValueContainer(),
          debugDescription: "Value is neither UInt32 nor String")
      }
    }

    init(
      id: UInt32 = 1,
      fontFamily: String = "courier-new, courier, monospace",
      fontSize: UInt32 = 15,
      fontWeight: String = "normal",
      name: String = "New Profile",
      cursorBlink: Bool = false,
      cursorStyle: String = "block",
      shell: String = ProcessInfo.processInfo.environment["SHELL"] ?? "/bin/bash",
      shellArgs: String = "",
      scrollback: UInt32 = 4000,
      padding: String = "5px 0 10px 15px",
      copyOnSelect: Bool = true,
      macOptionIsMeta: Bool = true,
      hideContextMenu: Bool = true,
      rightClickSelectsWord: Bool = true,
      macOptionClickForcesSelection: Bool = true,
      vibrancy: String? = nil,
      ligatures: Bool = false,
      theme: Theme = Theme(),
      keybindings: [Keybinding]? = nil
    ) {
      self.id = id
      self.fontFamily = fontFamily
      self.fontSize = fontSize
      self.fontWeight = fontWeight
      self.name = name
      self.cursorBlink = cursorBlink
      self.cursorStyle = cursorStyle
      self.shell = shell
      self.shellArgs = shellArgs
      self.scrollback = scrollback
      self.padding = padding
      self.copyOnSelect = copyOnSelect
      self.macOptionIsMeta = macOptionIsMeta
      self.hideContextMenu = hideContextMenu
      self.rightClickSelectsWord = rightClickSelectsWord
      self.macOptionClickForcesSelection = macOptionClickForcesSelection
      self.vibrancy = vibrancy
      self.ligatures = ligatures
      self.theme = theme
      self.keybindings = keybindings
    }

    public init(from decoder: Decoder) throws {
      let container = try decoder.container(keyedBy: CodingKeys.self)
      let defaultProfile = Profile()

      self.id = try container.decodeIfPresent(UInt32.self, forKey: .id) ?? defaultProfile.id
      self.fontFamily =
        try container.decodeIfPresent(String.self, forKey: .fontFamily) ?? defaultProfile.fontFamily
      let fontSizeValue = try container.decodeIfPresent(FontSizeValue.self, forKey: .fontSize)
      switch fontSizeValue {
      case .int(let value):
        self.fontSize = value
      case nil:
        self.fontSize = defaultProfile.fontSize
      }
      self.fontWeight =
        try container.decodeIfPresent(String.self, forKey: .fontWeight) ?? defaultProfile.fontWeight
      self.name = try container.decodeIfPresent(String.self, forKey: .name) ?? defaultProfile.name
      self.cursorBlink =
        try container.decodeIfPresent(Bool.self, forKey: .cursorBlink) ?? defaultProfile.cursorBlink
      self.cursorStyle =
        try container.decodeIfPresent(String.self, forKey: .cursorStyle)
        ?? defaultProfile.cursorStyle
      self.shell =
        try container.decodeIfPresent(String.self, forKey: .shell) ?? defaultProfile.shell
      self.shellArgs =
        try container.decodeIfPresent(String.self, forKey: .shellArgs) ?? defaultProfile.shellArgs
      self.scrollback =
        try container.decodeIfPresent(UInt32.self, forKey: .scrollback) ?? defaultProfile.scrollback
      self.padding =
        try container.decodeIfPresent(String.self, forKey: .padding) ?? defaultProfile.padding
      self.copyOnSelect =
        try container.decodeIfPresent(Bool.self, forKey: .copyOnSelect)
        ?? defaultProfile.copyOnSelect
      self.macOptionIsMeta =
        try container.decodeIfPresent(Bool.self, forKey: .macOptionIsMeta)
        ?? defaultProfile.macOptionIsMeta
      self.hideContextMenu =
        try container.decodeIfPresent(Bool.self, forKey: .hideContextMenu)
        ?? defaultProfile.hideContextMenu
      self.rightClickSelectsWord =
        try container.decodeIfPresent(Bool.self, forKey: .rightClickSelectsWord)
        ?? defaultProfile.rightClickSelectsWord
      self.macOptionClickForcesSelection =
        try container.decodeIfPresent(Bool.self, forKey: .macOptionClickForcesSelection)
        ?? defaultProfile.macOptionClickForcesSelection
      self.vibrancy =
        try container.decodeIfPresent(String.self, forKey: .vibrancy) ?? defaultProfile.vibrancy
      self.ligatures =
        try container.decodeIfPresent(Bool.self, forKey: .ligatures) ?? defaultProfile.ligatures
      self.theme = try container.decodeIfPresent(Theme.self, forKey: .theme) ?? defaultProfile.theme
      self.keybindings =
        try container.decodeIfPresent([Keybinding].self, forKey: .keybindings)
        ?? defaultProfile.keybindings
    }

    func parsedShellArgs() -> [String] {
      shellArgs
        .split(separator: ",")
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty }
    }

    struct Theme: Codable {
      var selectionBackground: String
      var foreground: String
      var background: String
      var black: String
      var red: String
      var brightRed: String
      var green: String
      var brightGreen: String
      var yellow: String
      var brightYellow: String
      var magenta: String
      var brightMagenta: String
      var cyan: String
      var brightCyan: String
      var blue: String
      var brightBlue: String
      var white: String
      var brightWhite: String
      var brightBlack: String
      var cursorAccent: String
      var cursor: String

      init(
        selectionBackground: String = "rgba(151, 151, 155, 0.2)",
        foreground: String = "#eff0eb",
        background: String = "#282a36",
        black: String = "#282a36",
        red: String = "#ff5c57",
        brightRed: String = "#ff5c57",
        green: String = "#5af78e",
        brightGreen: String = "#5af78e",
        yellow: String = "#f3f99d",
        brightYellow: String = "#f3f99d",
        magenta: String = "#ff6ac1",
        brightMagenta: String = "#ff6ac1",
        cyan: String = "#9aedfe",
        brightCyan: String = "#9aedfe",
        blue: String = "#57c7ff",
        brightBlue: String = "#57c7ff",
        white: String = "#f1f1f0",
        brightWhite: String = "#eff0eb",
        brightBlack: String = "#686868",
        cursorAccent: String = "#282a36",
        cursor: String = "#97979b"
      ) {

        self.selectionBackground = selectionBackground
        self.foreground = foreground
        self.background = background
        self.black = black
        self.red = red
        self.brightRed = brightRed
        self.green = green
        self.brightGreen = brightGreen
        self.yellow = yellow
        self.brightYellow = brightYellow
        self.magenta = magenta
        self.brightMagenta = brightMagenta
        self.cyan = cyan
        self.brightCyan = brightCyan
        self.blue = blue
        self.brightBlue = brightBlue
        self.white = white
        self.brightWhite = brightWhite
        self.brightBlack = brightBlack
        self.cursorAccent = cursorAccent
        self.cursor = cursor
      }

      public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let defaultTheme = Theme()
        self.selectionBackground =
          try container.decodeIfPresent(String.self, forKey: .selectionBackground)
          ?? defaultTheme.selectionBackground
        self.foreground =
          try container.decodeIfPresent(String.self, forKey: .foreground)
          ?? defaultTheme.foreground
        self.background =
          try container.decodeIfPresent(String.self, forKey: .background)
          ?? defaultTheme.background
        self.black =
          try container.decodeIfPresent(String.self, forKey: .black)
          ?? defaultTheme.black
        self.red =
          try container.decodeIfPresent(String.self, forKey: .red)
          ?? defaultTheme.red
        self.brightRed =
          try container.decodeIfPresent(String.self, forKey: .brightRed)
          ?? defaultTheme.brightRed
        self.green =
          try container.decodeIfPresent(String.self, forKey: .green)
          ?? defaultTheme.green
        self.brightGreen =
          try container.decodeIfPresent(String.self, forKey: .brightGreen)
          ?? defaultTheme.brightGreen
        self.yellow =
          try container.decodeIfPresent(String.self, forKey: .yellow)
          ?? defaultTheme.yellow
        self.brightYellow =
          try container.decodeIfPresent(String.self, forKey: .brightYellow)
          ?? defaultTheme.brightYellow
        self.magenta =
          try container.decodeIfPresent(String.self, forKey: .magenta)
          ?? defaultTheme.magenta

        self.brightMagenta =
          try container.decodeIfPresent(String.self, forKey: .brightMagenta)
          ?? defaultTheme.brightMagenta
        self.cyan =
          try container.decodeIfPresent(String.self, forKey: .cyan)
          ?? defaultTheme.cyan
        self.brightCyan =
          try container.decodeIfPresent(String.self, forKey: .brightCyan)
          ?? defaultTheme.brightCyan
        self.blue =
          try container.decodeIfPresent(String.self, forKey: .blue)
          ?? defaultTheme.blue
        self.brightBlue =
          try container.decodeIfPresent(String.self, forKey: .brightBlue)
          ?? defaultTheme.brightBlue
        self.white =
          try container.decodeIfPresent(String.self, forKey: .white)
          ?? defaultTheme.white
        self.brightWhite =
          try container.decodeIfPresent(String.self, forKey: .brightWhite)
          ?? defaultTheme.brightWhite
        self.brightBlack =
          try container.decodeIfPresent(String.self, forKey: .brightBlack)
          ?? defaultTheme.brightBlack
        self.cursorAccent =
          try container.decodeIfPresent(String.self, forKey: .cursorAccent)
          ?? defaultTheme.cursorAccent
        self.cursor =
          try container.decodeIfPresent(String.self, forKey: .cursor)
          ?? defaultTheme.cursor
      }
    }

    struct Keybinding: Codable {
      var keystroke: String
      var command: String
    }
  }
}
