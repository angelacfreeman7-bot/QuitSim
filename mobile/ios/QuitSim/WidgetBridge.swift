import Foundation
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {

    private let suiteName = "group.app.quitsim.mobile"

    @objc
    func setWidgetData(_ data: NSDictionary,
                       resolve: @escaping RCTPromiseResolveBlock,
                       reject: @escaping RCTPromiseRejectBlock) {
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            reject("ERR_NO_SUITE", "Could not access App Group UserDefaults", nil)
            return
        }

        if let confidence = data["confidenceScore"] as? Int {
            defaults.set(confidence, forKey: "widget_confidence")
        }
        if let freedomDate = data["freedomDate"] as? String {
            defaults.set(freedomDate, forKey: "widget_freedomDate")
        }
        if let runway = data["runwayMonths"] as? Int {
            defaults.set(runway, forKey: "widget_runwayMonths")
        }

        let formatter = ISO8601DateFormatter()
        defaults.set(formatter.string(from: Date()), forKey: "widget_lastUpdated")
        defaults.synchronize()

        // Tell WidgetKit to refresh
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        resolve(true)
    }

    @objc
    func reloadWidget() {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
    }
}
