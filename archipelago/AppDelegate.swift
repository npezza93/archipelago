import Cocoa
import Strada
import UserNotifications

@main
class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
  func applicationWillFinishLaunching(_ aNotification: Notification) {
    let app = FileManager.default.urls(
      for: .applicationSupportDirectory, in: .userDomainMask
    ).first!.appendingPathComponent("Archipelago/Archipelago.app")

    #if !DEBUG
      if FileManager.default.fileExists(atPath: app.path) {
        let process = Process()
        let scriptPath = Bundle.main.path(forResource: "updater", ofType: "sh")

        process.executableURL = URL(fileURLWithPath: scriptPath!)

        try! process.run()
      }
    #endif
  }

  func applicationDidFinishLaunching(_ aNotification: Notification) {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert]) { granted, error in
      if let error = error {
        print("Error requesting authorization: \(error.localizedDescription)")
      }
    }
    UNUserNotificationCenter.current().delegate = self

    #if DEBUG
      Strada.config.debugLoggingEnabled = true
    #endif
  }

  func applicationWillTerminate(_ aNotification: Notification) {
    // Insert code here to tear down your application
  }

  func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler(.banner)
  }

  func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool
  {
    if !flag {
      if let menuItem = NSApp.mainMenu?.item(withTitle: "Shell")?.submenu?.item(
        withTitle: "New Window")
      {
        (menuItem as! NewWindowMenuItem).createWindowAction()
      }
    }
    return true
  }

}
