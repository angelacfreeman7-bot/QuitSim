import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { TabNavigator } from './src/navigation/TabNavigator';
import { loadPremiumStatus } from './src/lib/premium';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initSentry, withSentry } from './src/lib/sentry';
import { useSimStore } from './src/stores/useSimStore';
import { refreshNotifications } from './src/lib/notifications';
import { NotificationPrompt } from './src/components/NotificationPrompt';
import { ThemeProvider, useTheme } from './src/lib/theme';

// Initialize Sentry as early as possible
initSentry();

// Keep the native splash screen visible while we load
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppInner() {
  const BRAND = useTheme();
  const [ready, setReady] = useState(false);
  const hasHydrated = useSimStore((s) => s._hasHydrated);
  const welcomeSeen = useSimStore((s) => s.welcomeSeen);
  const setWelcomeSeen = useSimStore((s) => s.setWelcomeSeen);
  const acceptDisclaimer = useSimStore((s) => s.acceptDisclaimer);
  const setProfile = useSimStore((s) => s.setProfile);
  const onboarded = useSimStore((s) => s.onboarded);
  const showNotifPrompt = useSimStore((s) => s.showNotificationPrompt);
  const dismissNotifPrompt = useSimStore((s) => s.dismissNotificationPrompt);
  const splashHidden = useRef(false);

  // Hide splash exactly once — called from multiple places to guarantee it fires
  const hideSplash = useCallback(async () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    await SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    // Load premium status with a tight timeout so it never blocks the app
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));
    Promise.race([loadPremiumStatus(), timeout])
      .catch(() => {
        // Premium status failed — default to free tier, don't block the app
      })
      .finally(() => setReady(true));
  }, []);

  // Safety net: if hydration hasn't happened after 3 seconds, force it
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useSimStore.getState()._hasHydrated) {
        console.warn('[App] Store hydration timed out — forcing _hasHydrated');
        useSimStore.setState({ _hasHydrated: true });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide splash when ready — this is the primary path
  useEffect(() => {
    if (ready && hasHydrated) {
      hideSplash();
    }
  }, [ready, hasHydrated, hideSplash]);

  // Refresh notifications every time the app opens (rotates messages, resets comeback timer)
  useEffect(() => {
    if (ready && hasHydrated && onboarded) {
      refreshNotifications().catch(() => {});
    }
  }, [ready, hasHydrated, onboarded]);

  // NUCLEAR FAILSAFE: if splash is STILL showing after 5 seconds, force hide it.
  // This prevents the black screen bug no matter what goes wrong above.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!splashHidden.current) {
        console.warn('[App] Splash failsafe triggered — force hiding after 5s');
        setReady(true);
        useSimStore.setState({ _hasHydrated: true });
        hideSplash();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [hideSplash]);

  const statusBarStyle = BRAND.isDark ? 'light' : 'dark';

  if (!ready || !hasHydrated) {
    return (
      <View style={[styles.splash, { backgroundColor: BRAND.bg }]}>
        <StatusBar style={statusBarStyle} />
        <Text style={[styles.splashLogo, { color: BRAND.text }]}>
          Quit<Text style={styles.splashAccent}>Sim</Text>
        </Text>
        <ActivityIndicator
          size="small"
          color="#F97316"
          style={styles.splashSpinner}
        />
      </View>
    );
  }

  // Welcome screen handles intro + disclaimer + initial numbers in one flow.
  // No separate onboarding — go straight to the dashboard after welcome.
  if (!welcomeSeen) {
    return (
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar style={statusBarStyle} />
          <WelcomeScreen onComplete={(numbers) => {
            if (numbers) {
              setProfile({
                salary: numbers.salary,
                savings: numbers.savings,
                investments: 0,
                monthlyExpenses: numbers.expenses,
                debt: 0,
              });
            }
            setWelcomeSeen(true);
            acceptDisclaimer();
            // Skip onboarding — the sliders gave us enough to start.
            // Users can refine from the Profile screen.
            useSimStore.getState().setOnboarded(true);
          }} />
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        {!onboarded ? (
          <>
            <StatusBar style={statusBarStyle} />
            <OnboardingScreen />
          </>
        ) : (
          <NavigationContainer>
            <StatusBar style={statusBarStyle} />
            <TabNavigator />
            <NotificationPrompt
              visible={showNotifPrompt}
              onDismiss={dismissNotifPrompt}
            />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function App() {
  const themePreference = useSimStore((s) => s.themePreference);

  return (
    <ThemeProvider preference={themePreference}>
      <AppInner />
    </ThemeProvider>
  );
}

// Wrap with Sentry for automatic error & performance tracking
export default withSentry(App);

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 36,
    fontWeight: '800',
  },
  splashAccent: {
    color: '#0EA5E9',
  },
  splashSpinner: {
    marginTop: 20,
  },
});
