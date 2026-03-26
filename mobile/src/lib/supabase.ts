import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

// ─── Secure storage adapter (iOS Keychain / Android Keystore) ──
const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ─── Environment variables ─────────────────────────────────────
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Cloud sync will be unavailable.'
  );
}

// ─── Singleton client ──────────────────────────────────────────
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // not needed for native apps
    },
  }
);

/**
 * Whether Supabase is configured (env vars present).
 * Use this to conditionally enable cloud features.
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// ─── App state listener: pause/resume token refresh ────────────
// Prevents stale sessions after backgrounding.
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;

  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
