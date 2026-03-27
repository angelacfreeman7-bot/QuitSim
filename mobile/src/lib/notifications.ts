import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSimStore } from '../stores/useSimStore';

// Storage keys
const NOTIF_PERMISSION_KEY = 'quitsim:notif_permission';
const NOTIF_SCHEDULED_KEY = 'quitsim:notif_scheduled';

// Check if the native notifications module is actually available.
// In Expo Go the JS module loads fine but native calls throw.
let _nativeAvailable: boolean | null = null;

function isNativeAvailable(): boolean {
  if (_nativeAvailable !== null) return _nativeAvailable;
  try {
    const { NativeModulesProxy } = require('expo-modules-core');
    _nativeAvailable = !!NativeModulesProxy?.ExpoPushTokenManager;
  } catch {
    _nativeAvailable = false;
  }
  if (!_nativeAvailable) {
    console.warn('[Notifications] Native module not available — notifications disabled (Expo Go?)');
  }
  return _nativeAvailable;
}

function getNotifications(): typeof import('expo-notifications') | null {
  if (!isNativeAvailable()) return null;
  return require('expo-notifications');
}

let _handlerConfigured = false;

function ensureHandler() {
  if (_handlerConfigured) return;
  const N = getNotifications();
  if (!N) return;
  _handlerConfigured = true;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ─── Permission ─────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  ensureHandler();

  const { status: existing } = await N.getPermissionsAsync();
  if (existing === 'granted') {
    await AsyncStorage.setItem(NOTIF_PERMISSION_KEY, 'granted');
    return true;
  }

  const { status } = await N.requestPermissionsAsync();
  const granted = status === 'granted';
  await AsyncStorage.setItem(NOTIF_PERMISSION_KEY, granted ? 'granted' : 'denied');
  return granted;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  const { status } = await N.getPermissionsAsync();
  return status === 'granted';
}

// ─── Notification content library ───────────────────────

const DAILY_CHALLENGE_MESSAGES = [
  { title: 'Your daily challenge is ready', body: "Small steps, big freedom. Today's challenge takes under 5 minutes." },
  { title: 'Time for today\'s money move', body: 'One small action today could shift your freedom date forward.' },
  { title: 'Quick win waiting for you', body: "Today's challenge is ready. Keep your streak alive!" },
  { title: 'Your streak is counting on you', body: 'Open QuitSim and knock out today\'s challenge.' },
  { title: 'Freedom check-in', body: "How's your plan looking? Today's challenge might surprise you." },
  { title: 'Don\'t break the chain', body: 'Your streak is going strong. Keep it up with today\'s challenge.' },
  { title: 'Got 2 minutes?', body: 'That\'s all it takes. Your daily challenge is waiting.' },
];

const WEEKLY_FALLBACK_MESSAGES = [
  { title: 'Weekly check-in', body: 'Your numbers may have changed. See how your freedom date looks this week.' },
  { title: 'How\'s your plan doing?', body: 'A quick peek at your dashboard could reveal new insights.' },
  { title: 'Time for a freedom check', body: 'Has anything changed this week? Update your numbers and see.' },
];

// ─── Smart weekly message builder ────────────────────────

function formatMonthsAsText(months: number): string {
  if (months < 1) return 'less than a month';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0 && m > 0) return `${y} year${y > 1 ? 's' : ''} and ${m} month${m > 1 ? 's' : ''}`;
  if (y > 0) return `${y} year${y > 1 ? 's' : ''}`;
  return `${m} month${m > 1 ? 's' : ''}`;
}

function formatFreedomDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function monthsUntil(isoDate: string): number {
  const now = new Date();
  const target = new Date(isoDate);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / (30.44 * 24 * 60 * 60 * 1000)));
}

interface SmartMessage {
  title: string;
  body: string;
}

function buildSmartWeeklyMessage(): SmartMessage {
  const state = useSimStore.getState();
  const { result, weeklySnapshot } = state;

  // If no simulation result yet, fall back to generic
  if (!result) return pickRandom(WEEKLY_FALLBACK_MESSAGES);

  const { quitConfidence, runwayMonths, freedomDate } = result;
  const candidates: { msg: SmartMessage; priority: number }[] = [];

  // ── Confidence-based messages ──
  if (quitConfidence >= 80) {
    candidates.push({
      msg: { title: 'You\'re almost there', body: `You're ${quitConfidence}% ready to quit. The finish line is in sight.` },
      priority: 3,
    });
  } else if (quitConfidence >= 50) {
    const gap = 80 - quitConfidence;
    candidates.push({
      msg: { title: 'Climbing toward freedom', body: `You're ${quitConfidence}% ready to quit. One small change could close the ${gap}-point gap to 80%.` },
      priority: 2,
    });
  } else {
    candidates.push({
      msg: { title: 'Building your foundation', body: `You're at ${quitConfidence}% — every small step compounds. Open QuitSim and explore what moves the needle.` },
      priority: 1,
    });
  }

  // ── Runway-based messages ──
  candidates.push({
    msg: { title: 'Runway update', body: `Your runway is ${formatMonthsAsText(runwayMonths)}. That's ${runwayMonths >= 6 ? 'a solid cushion' : 'a start — let\'s grow it'}.` },
    priority: runwayMonths >= 12 ? 3 : 2,
  });

  // ── Freedom date messages ──
  if (freedomDate) {
    const away = monthsUntil(freedomDate);
    const formatted = formatFreedomDate(freedomDate);
    candidates.push({
      msg: { title: 'Freedom date check', body: `Your freedom date is ${formatted} — just ${away} month${away !== 1 ? 's' : ''} away.` },
      priority: 2,
    });
  }

  // ── Weekly delta messages (highest priority when available) ──
  if (weeklySnapshot) {
    const confDelta = quitConfidence - weeklySnapshot.confidence;
    const runwayDelta = runwayMonths - weeklySnapshot.runway;

    if (confDelta > 0) {
      candidates.push({
        msg: { title: 'You leveled up', body: `You're ${quitConfidence}% ready to quit — up ${confDelta} points from last week. Nice work.` },
        priority: 5,
      });
    } else if (confDelta < 0) {
      candidates.push({
        msg: { title: 'Let\'s bounce back', body: `Your confidence dipped ${Math.abs(confDelta)} points to ${quitConfidence}%. A quick tweak could turn that around.` },
        priority: 4,
      });
    }

    if (runwayDelta > 0) {
      candidates.push({
        msg: { title: 'More runway', body: `Your runway is ${formatMonthsAsText(runwayMonths)} — that's ${runwayDelta} month${runwayDelta !== 1 ? 's' : ''} longer than last week.` },
        priority: 5,
      });
    } else if (runwayDelta < 0) {
      candidates.push({
        msg: { title: 'Runway check', body: `Your runway shortened by ${Math.abs(runwayDelta)} month${Math.abs(runwayDelta) !== 1 ? 's' : ''}. Update your numbers and see what helps.` },
        priority: 4,
      });
    }

    if (confDelta === 0 && runwayDelta === 0) {
      candidates.push({
        msg: { title: 'Holding steady', body: `Same confidence (${quitConfidence}%), same runway. Stability is good — or try something new to push forward.` },
        priority: 3,
      });
    }
  }

  // Pick from the highest-priority bucket, randomly if there are ties
  const maxPriority = Math.max(...candidates.map((c) => c.priority));
  const topCandidates = candidates.filter((c) => c.priority === maxPriority);
  return pickRandom(topCandidates).msg;
}

const COMEBACK_MESSAGES = [
  { title: 'Your freedom date misses you', body: 'It\'s been a few days. Your simulation is waiting for an update.' },
  { title: 'Still on track?', body: 'Check in on your plan — a lot can change in a few days.' },
  { title: 'Your future self says hi', body: 'Open QuitSim and see where you stand today.' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Schedule notifications ─────────────────────────────

export async function scheduleAllNotifications(): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  ensureHandler();

  const granted = await hasNotificationPermission();
  if (!granted) return;

  // Cancel existing scheduled notifications to avoid duplicates
  await N.cancelAllScheduledNotificationsAsync();

  // 1. Daily challenge reminder — every day at 9:00 AM
  const dailyMsg = pickRandom(DAILY_CHALLENGE_MESSAGES);
  await N.scheduleNotificationAsync({
    content: {
      title: dailyMsg.title,
      body: dailyMsg.body,
      sound: 'default',
      data: { type: 'daily_challenge' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  // 2. Weekly progress check — Sunday at 7:00 PM (evening wind-down)
  const weeklyMsg = buildSmartWeeklyMessage();
  await N.scheduleNotificationAsync({
    content: {
      title: weeklyMsg.title,
      body: weeklyMsg.body,
      sound: 'default',
      data: { type: 'weekly_progress' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 19,
      minute: 0,
    },
  });

  // 3. Comeback nudge — 3 days from now (re-scheduled each app open)
  const comebackMsg = pickRandom(COMEBACK_MESSAGES);
  await N.scheduleNotificationAsync({
    content: {
      title: comebackMsg.title,
      body: comebackMsg.body,
      sound: 'default',
      data: { type: 'comeback' },
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3 * 24 * 60 * 60, // 3 days
      repeats: false,
    },
  });

  await AsyncStorage.setItem(NOTIF_SCHEDULED_KEY, new Date().toISOString());
}

// ─── Reschedule on app open ─────────────────────────────

export async function refreshNotifications(): Promise<void> {
  if (!isNativeAvailable()) return;
  const granted = await hasNotificationPermission();
  if (!granted) return;
  await scheduleAllNotifications();
}

// ─── Cancel all ─────────────────────────────────────────

export async function cancelAllNotifications(): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(NOTIF_SCHEDULED_KEY);
}
