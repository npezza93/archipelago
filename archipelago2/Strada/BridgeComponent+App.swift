import Foundation
import Strada

extension BridgeComponent {
  static var allTypes: [BridgeComponent.Type] {
    [
      TerminalComponent.self,
      TabsComponent.self,
    ]
  }
}
