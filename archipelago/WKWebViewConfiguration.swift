import Foundation
import Strada
import WebKit

enum WebViewPool {
  static var shared = WKProcessPool()
}

extension WKWebViewConfiguration {
  @MainActor
  static var appConfiguration: WKWebViewConfiguration {
    let stradaSubstring = Strada.userAgentSubstring(for: BridgeComponent.allTypes)
    let userAgent = "Turbo Native iOS \(stradaSubstring)"

    let configuration = WKWebViewConfiguration()
    configuration.processPool = WebViewPool.shared
    configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
    configuration.applicationNameForUserAgent = userAgent
    configuration.defaultWebpagePreferences?.preferredContentMode = .mobile

    return configuration
  }
}
