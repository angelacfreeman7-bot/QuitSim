import WidgetKit
import SwiftUI

// MARK: - Shared Data

struct WidgetData {
    let confidenceScore: Int
    let freedomDate: String
    let runwayMonths: Int
    let lastUpdated: String

    static let placeholder = WidgetData(
        confidenceScore: 65,
        freedomDate: "Mar 2028",
        runwayMonths: 14,
        lastUpdated: ""
    )

    static let empty = WidgetData(
        confidenceScore: 0,
        freedomDate: "—",
        runwayMonths: 0,
        lastUpdated: ""
    )

    static func fromUserDefaults() -> WidgetData {
        guard let defaults = UserDefaults(suiteName: "group.app.quitsim.mobile") else {
            return .empty
        }
        let score = defaults.integer(forKey: "widget_confidence")
        let date = defaults.string(forKey: "widget_freedomDate") ?? "—"
        let runway = defaults.integer(forKey: "widget_runwayMonths")
        let updated = defaults.string(forKey: "widget_lastUpdated") ?? ""

        if score == 0 && runway == 0 {
            return .empty
        }
        return WidgetData(
            confidenceScore: score,
            freedomDate: date,
            runwayMonths: runway,
            lastUpdated: updated
        )
    }
}

// MARK: - Timeline Provider

struct QuitSimProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuitSimEntry {
        QuitSimEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (QuitSimEntry) -> Void) {
        let data = context.isPreview ? WidgetData.placeholder : WidgetData.fromUserDefaults()
        completion(QuitSimEntry(date: Date(), data: data))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuitSimEntry>) -> Void) {
        let data = WidgetData.fromUserDefaults()
        let entry = QuitSimEntry(date: Date(), data: data)
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

struct QuitSimEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - Colors

struct WidgetColors {
    static let bg = Color(red: 1.0, green: 0.984, blue: 0.969) // #FFFBF7
    static let text = Color(red: 0.11, green: 0.098, blue: 0.09) // #1C1917
    static let textSecondary = Color(red: 0.47, green: 0.443, blue: 0.424) // #78716C
    static let sunset = Color(red: 0.976, green: 0.451, blue: 0.086) // #F97316
    static let primary = Color(red: 0.055, green: 0.647, blue: 0.914) // #0EA5E9
    static let success = Color(red: 0.063, green: 0.725, blue: 0.506) // #10B981
    static let warning = Color(red: 0.961, green: 0.620, blue: 0.043) // #F59E0B
    static let danger = Color(red: 0.937, green: 0.267, blue: 0.267) // #EF4444

    static func scoreColor(for score: Int) -> Color {
        if score >= 70 { return success }
        if score >= 40 { return warning }
        return danger
    }

    static func scoreEmoji(for score: Int) -> String {
        if score >= 70 { return "🌟" }
        if score >= 40 { return "📈" }
        return "🌱"
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    let data: WidgetData

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("QuitSim")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(WidgetColors.textSecondary)
                Spacer()
                Text(WidgetColors.scoreEmoji(for: data.confidenceScore))
                    .font(.system(size: 14))
            }

            Spacer()

            if data.confidenceScore > 0 {
                Text("\(data.confidenceScore)%")
                    .font(.system(size: 36, weight: .heavy, design: .rounded))
                    .foregroundColor(WidgetColors.scoreColor(for: data.confidenceScore))

                Text(data.freedomDate)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(WidgetColors.text)

                Text("Freedom Date")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(WidgetColors.textSecondary)
            } else {
                Text("Open QuitSim")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(WidgetColors.text)
                Text("to see your score")
                    .font(.system(size: 12))
                    .foregroundColor(WidgetColors.textSecondary)
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .background(WidgetColors.bg)
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    let data: WidgetData

    var body: some View {
        HStack(spacing: 16) {
            // Left: Confidence Score
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Text("QuitSim")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(WidgetColors.textSecondary)
                    Text(WidgetColors.scoreEmoji(for: data.confidenceScore))
                        .font(.system(size: 12))
                }

                Spacer()

                if data.confidenceScore > 0 {
                    Text("\(data.confidenceScore)%")
                        .font(.system(size: 40, weight: .heavy, design: .rounded))
                        .foregroundColor(WidgetColors.scoreColor(for: data.confidenceScore))
                    Text("Confidence")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(WidgetColors.textSecondary)
                } else {
                    Text("Open QuitSim")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(WidgetColors.text)
                }
            }

            if data.confidenceScore > 0 {
                // Divider
                Rectangle()
                    .fill(Color(red: 0.953, green: 0.929, blue: 0.906).opacity(0.8))
                    .frame(width: 1)
                    .padding(.vertical, 8)

                // Right: Freedom Date + Runway
                VStack(alignment: .leading, spacing: 8) {
                    Spacer()

                    VStack(alignment: .leading, spacing: 2) {
                        Text("🌅 Freedom Date")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(WidgetColors.textSecondary)
                        Text(data.freedomDate)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(WidgetColors.text)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text("🛤️ Runway")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(WidgetColors.textSecondary)
                        Text("\(data.runwayMonths) months")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(WidgetColors.primary)
                    }

                    Spacer()
                }
            }

            Spacer()
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(WidgetColors.bg)
    }
}

// MARK: - Widget Definition

struct QuitSimWidget: Widget {
    let kind: String = "QuitSimWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuitSimProvider()) { entry in
            if #available(iOS 17.0, *) {
                WidgetEntryView(entry: entry)
                    .containerBackground(WidgetColors.bg, for: .widget)
            } else {
                WidgetEntryView(entry: entry)
            }
        }
        .configurationDisplayName("Freedom Score")
        .description("Your quit confidence and freedom date at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: QuitSimEntry

    var body: some View {
        switch family {
        case .systemMedium:
            MediumWidgetView(data: entry.data)
        default:
            SmallWidgetView(data: entry.data)
        }
    }
}

// MARK: - Widget Bundle

@main
struct QuitSimWidgetBundle: WidgetBundle {
    var body: some Widget {
        QuitSimWidget()
    }
}

// MARK: - Previews

#if DEBUG
struct QuitSimWidget_Previews: PreviewProvider {
    static var previews: some View {
        SmallWidgetView(data: .placeholder)
            .previewContext(WidgetPreviewContext(family: .systemSmall))

        MediumWidgetView(data: .placeholder)
            .previewContext(WidgetPreviewContext(family: .systemMedium))

        SmallWidgetView(data: .empty)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
#endif
