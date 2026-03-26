import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const WEEKLY_PROGRESS_MESSAGES = [
  { title: 'Weekly check-in', body: 'Your numbers may have changed. See how your freedom date looks this week.' },
  { title: 'How\'s your plan doing?', body: 'A quick peek at your dashboard could reveal new insights.' },
  { title: 'Time for a freedom check', body: 'Has anything changed this week? Update your numbers and see.' },
];

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

  // 2. Weekly progress check — Sunday at 10:00 AM
  const weeklyMsg = pickRandom(WEEKLY_PROGRESS_MESSAGES);
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
      hour: 10,
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
