import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'QuitSim',
  slug: 'quitsim',
  version: '1.0.0',
  scheme: 'quitsim',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFBF7',
  },
  ios: {
    bundleIdentifier: 'app.quitsim.mobile',
    supportsTablet: false,
    infoPlist: {
      CFBundleDisplayName: 'QuitSim',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'app.quitsim.mobile',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a0a',
    },
  },
  plugins: [
    'expo-secure-store',
    'expo-splash-screen',
    [
      'expo-notifications',
      {
        sounds: [],
      },
    ],
    [
      '@sentry/react-native',
      {
        organization: process.env.SENTRY_ORG ?? '',
        project: process.env.SENTRY_PROJECT ?? '',
      },
    ],
    './plugins/withWidget',
  ],
  extra: {
    // Set via EAS Secrets
    revenueCatApiKey: process.env.REVENUECAT_API_KEY ?? '',
    sentryDsn: process.env.SENTRY_DSN ?? '',
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
  },
});
