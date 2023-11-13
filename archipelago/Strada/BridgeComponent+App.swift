import Foundation
import Strada

extension BridgeComponent {
  static var allTypes: [BridgeComponent.Type] {
    [
      TerminalComponent.self,
      TabsComponent.self,
      RadioComponent.self,
      FontsComponent.self,
      SelectComponent.self,
      CheckboxComponent.self,
      TextComponent.self,
      ColorComponent.self,
      KeybindingsComponent.self,
      KeybindingCapturerComponent.self,
      KeybindingActionsComponent.self,
      ProfilesComponent.self,
      ProfileCapturerComponent.self,
    ]
  }
}
