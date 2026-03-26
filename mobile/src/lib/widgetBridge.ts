import { NativeModules, Platform } from 'react-native';

const { WidgetBridge } = NativeModules;

interface WidgetData {
  confidenceScore: number;
  freedomDate: string;
  runwayMonths: number;
}

/**
 * Write simulation results to the shared App Group storage
 * so the iOS Home Screen widget can display them.
 */
export async function updateWidgetData(data: WidgetData): Promise<void> {
  if (Platform.OS !== 'ios' || !WidgetBridge) return;

  try {
    await WidgetBridge.setWidgetData({
      confidenceScore: Math.round(data.confidenceScore),
      freedomDate: data.freedomDate,
      runwayMonths: Math.round(data.runwayMonths),
    });
  } catch (e) {
    // Widget bridge failure should never block the app
    console.warn('[WidgetBridge] Failed to update widget data:', e);
  }
}

/**
 * Force the widget to refresh its timeline.
 */
export function reloadWidget(): void {
  if (Platform.OS !== 'ios' || !WidgetBridge) return;
  try {
    WidgetBridge.reloadWidget();
  } catch {
    // Silently ignore
  }
}
