import Cocoa
import Strada
import WebKit

class ViewController: NSViewController, WKUIDelegate, NSWindowDelegate, BridgeDestination {
  @IBOutlet var webView: WKWebView!
  var vibrantView: NSVisualEffectView?
  var currentZoomFactor: CGFloat = 1.0
  var settingChangeListener: SettingChangeListenerWrapper?
  var profileChangeListener: ProfileChangeListenerWrapper?

  private lazy var url: URL = {
    URL(fileURLWithPath: Bundle.main.path(forResource: "index", ofType: "html")!)
  }()
  private lazy var bridgeDelegate: BridgeDelegate = {
    BridgeDelegate(
      location: "archipelago-1",
      destination: self,
      componentTypes: BridgeComponent.allTypes)
  }()

  override func loadView() {
    webView = WKWebView(
      frame: CGRect(x: 0, y: 0, width: 800, height: 600), configuration: .appConfiguration)

    let script = WKUserScript(
      source: monospsaceFontStylesheet(), injectionTime: .atDocumentStart, forMainFrameOnly: true)
    webView.configuration.userContentController.addUserScript(script)

    webView.setValue(false, forKey: "drawsBackground")

    let overlay = DraggingView(frame: CGRect(x: 0, y: 0, width: webView.frame.width, height: 30))
    overlay.wantsLayer = true
    overlay.layer?.backgroundColor = NSColor.clear.cgColor
    webView.addSubview(overlay)

    self.view = webView

    let vibrantView = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: 800, height: 600))
    vibrantView.blendingMode = .behindWindow
    vibrantView.material = NSVisualEffectView.Material.fullScreenUI
    vibrantView.state = .active
    vibrantView.autoresizingMask = [.width, .height]
    self.vibrantView = vibrantView
    self.toggleVibrantView()

    webView.uiDelegate = self
    webView.navigationDelegate = self
    #if DEBUG
      webView.configuration.preferences.setValue(true, forKey: "developerExtrasEnabled")
      webView.isInspectable = true
    #endif
    Bridge.initialize(webView)
    self.settingChangeListener = App.preferenceFile.onChange(listener: {
      (key: String, value: Any) in
      self.toggleVibrantView()
    })
    self.profileChangeListener = App.preferenceFile.onProfileChange(
      id: UUID().uuidString,
      listener: { (profile: String) in
        self.toggleVibrantView()
      })
  }

  func toggleVibrantView() {
    vibrantView?.removeFromSuperview()

    let background = NSColor(string: App.preferenceFile.activeProfile().theme.background)?
      .alphaComponent

    if let vibrant = vibrantView, (background ?? 1.0) < 1.0 {
      view.addSubview(vibrant, positioned: .below, relativeTo: webView)
    }
  }

  override func viewWillAppear() {
    super.viewWillAppear()
    bridgeDelegate.onViewWillAppear()
    self.view.window?.delegate = self
    bridgeDelegate.webViewDidBecomeActive(webView)
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    let path = self.url.deletingLastPathComponent()
    self.webView.loadFileURL(self.url, allowingReadAccessTo: path)
    self.view = webView
    bridgeDelegate.onViewDidLoad()
  }

  func windowWillClose(_ notification: Notification) {
    bridgeDelegate.onViewWillDisappear()
    if let wrapper = self.settingChangeListener {
      App.preferenceFile.removeChange(wrapper: wrapper)
    }
    if let wrapper = self.profileChangeListener {
      App.preferenceFile.removeProfileChange(wrapper: wrapper)
    }
  }

  private func monospsaceFontStylesheet() -> String {
    if let font = App.fonts.first(where: {
      $0.name == App.preferenceFile.activeProfile().fontFamily
    }) {
      return """
        document.addEventListener('DOMContentLoaded', () => {
            window.font = \(font.as_json())
        });
        """
    } else {
      return ""
    }
  }
}

extension ViewController: WKNavigationDelegate {
  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    print("Failed navigation: \(error.localizedDescription)")
  }

  func webView(
    _ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!,
    withError error: Error
  ) {
    print("Failed provisional navigation: \(error.localizedDescription)")
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
  }

  func webView(
    _ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
    for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures
  ) -> WKWebView? {
    if let url = navigationAction.request.url {
      NSWorkspace.shared.open(url)
    }
    return nil
  }
}

extension ViewController {
  @IBAction func zoomInAction(_ sender: Any) {
    currentZoomFactor += 0.1
    zoomWebView(to: currentZoomFactor)
  }

  @IBAction func zoomOutAction(_ sender: Any) {
    currentZoomFactor = max(currentZoomFactor - 0.1, 0.1)  // Prevents zooming out too much
    zoomWebView(to: currentZoomFactor)
  }

  @IBAction func zoomResetAction(_ sender: Any) {
    currentZoomFactor = 1.0
    zoomWebView(to: currentZoomFactor)
  }

  private func zoomWebView(to zoomFactor: CGFloat) {
    let javascript = """
        document.body.style.zoom = '\(currentZoomFactor)'
        window.dispatchEvent(new Event("resize"))
      """
    webView.evaluateJavaScript(javascript, completionHandler: nil)
  }
}
