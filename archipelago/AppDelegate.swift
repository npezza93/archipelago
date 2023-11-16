import Cocoa
import Strada
import UserNotifications

@main
class AppDelegate: NSObject, NSApplicationDelegate, UNUserNotificationCenterDelegate {
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

}
