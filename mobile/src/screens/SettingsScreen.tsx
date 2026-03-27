import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';
import { useSimStore } from '../stores/useSimStore';
import { useTheme, ThemePreference } from '../lib/theme';
import * as Haptics from 'expo-haptics';
import {
  hasNotificationPermission,
  requestNotificationPermission,
  scheduleAllNotifications,
  cancelAllNotifications,
} from '../lib/notifications';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const SUPPORT_EMAIL = 'support@quitsim.it.com';
const PRIVACY_URL = 'https://quitsim.it.com/privacy';
const TERMS_URL = 'https://quitsim.it.com/terms';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  detail?: string;
}

export function SettingsScreen({ navigation }: any) {
  const BRAND = useTheme();
  const themePreference = useSimStore((s) => s.themePreference);
  const setThemePreference = useSimStore((s) => s.setThemePreference);
  const [notifsEnabled, setNotifsEnabled] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    hasNotificationPermission().then(setNotifsEnabled);
  }, []);

  function SettingsRow({ icon, label, onPress, color = BRAND.text, detail }: SettingsRowProps) {
    return (
      <Pressable
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: BRAND.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.rowLeft}>
          <Ionicons name={icon} size={20} color={color} style={styles.rowIcon} />
          <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        </View>
        {detail ? (
          <Text style={[styles.rowDetail, { color: BRAND.textMuted }]}>{detail}</Text>
        ) : (
          <Ionicons name="chevron-forward" size={16} color={BRAND.textMuted} />
        )}
      </Pressable>
    );
  }

  const handleToggleNotifications = async () => {
    if (notifsEnabled) {
      await cancelAllNotifications();
      setNotifsEnabled(false);
      Alert.alert('Notifications off', 'You won\'t receive any more reminders from QuitSim.');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleAllNotifications();
        setNotifsEnabled(true);
      } else {
        Alert.alert(
          'Permission needed',
          'Open Settings to allow notifications for QuitSim.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset all data?',
      'This will erase your profile, saved plans, streaks, and all settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            useSimStore.getState().resetAllData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Data reset', 'All data has been cleared. The app will restart from the welcome screen.');
          },
        },
      ],
    );
  };

  const handleRateApp = async () => {
    const available = await StoreReview.isAvailableAsync();
    if (available) {
      StoreReview.requestReview();
    } else {
      // Fallback: open App Store page
      Linking.openURL('https://apps.apple.com/app/quitsim/id6761015566');
    }
  };

  const handleContact = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=QuitSim%20Support`);
  };

  const systemLabel = BRAND.isDark ? 'System (Dark)' : 'System (Light)';
  const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark', icon: 'moon-outline' },
    { value: 'system', label: systemLabel, icon: 'phone-portrait-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={BRAND.textSecondary} />
          </Pressable>
          <Text style={[styles.title, { color: BRAND.text }]}>Settings</Text>
          <View style={styles.backButton} />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>Appearance</Text>
        <View style={[styles.section, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((option) => {
              const isSelected = themePreference === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={[
                    styles.themeButton,
                    { borderColor: isSelected ? BRAND.primary : BRAND.cardBorder },
                    isSelected && { backgroundColor: BRAND.primaryLight },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setThemePreference(option.value);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${option.label} theme`}
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={isSelected ? BRAND.primary : BRAND.textSecondary}
                  />
                  <Text style={[
                    styles.themeButtonText,
                    { color: isSelected ? BRAND.primary : BRAND.textSecondary },
                    isSelected && { fontWeight: '700' },
                  ]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={BRAND.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Profile */}
        <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>Profile</Text>
        <View style={[styles.section, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <SettingsRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('Profile')}
          />
        </View>

        {/* Notifications */}
        <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>Notifications</Text>
        <View style={[styles.section, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <SettingsRow
            icon={notifsEnabled ? 'notifications' : 'notifications-off-outline'}
            label={notifsEnabled ? 'Notifications On' : 'Enable Notifications'}
            onPress={handleToggleNotifications}
            detail={notifsEnabled ? 'Tap to turn off' : 'Daily challenges & progress'}
          />
        </View>

        {/* Legal */}
        <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>Legal</Text>
        <View style={[styles.section, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <View style={[styles.divider, { backgroundColor: BRAND.cardBorder }]} />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => Linking.openURL(TERMS_URL)}
          />
          <View style={[styles.divider, { backgroundColor: BRAND.cardBorder }]} />
          <SettingsRow
            icon="warning-outline"
            label="Disclaimer"
            onPress={() => {
              navigation.goBack();
              // Small delay so we're back on a screen where the modal shows
              setTimeout(() => useSimStore.getState().showDisclaimerModal(), 200);
            }}
          />
        </View>

        {/* Support */}
        <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>Support</Text>
        <View style={[styles.section, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <SettingsRow
            icon="help-circle-outline"
            label="FAQ & How It Works"
            onPress={() => navigation.navigate('FAQ')}
          />
          <View style={[styles.divider, { backgroundColor: BRAND.cardBorder }]} />
          <SettingsRow
            icon="mail-outline"
            label="Contact Support"
            onPress={handleContact}
            detail={SUPPORT_EMAIL}
          />
          <View style={[styles.divider, { backgroundColor: BRAND.cardBorder }]} />
          <SettingsRow
            icon="star-outline"
            label="Rate QuitSim"
            onPress={handleRateApp}
          />
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>Data</Text>
        <View style={[styles.section, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <SettingsRow
            icon="trash-outline"
            label="Reset All Data"
            onPress={handleResetData}
            color="#ef4444"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: BRAND.textSecondary }]}>QuitSim v{APP_VERSION}</Text>
          <Text style={[styles.footerText, { color: BRAND.textSecondary }]}>All calculations run on-device.</Text>
          <Text style={[styles.footerText, { color: BRAND.textSecondary }]}>Your data never leaves your phone.</Text>
        </View>

        {/* Dev tools */}
        {__DEV__ && (
          <Pressable
            style={styles.devLink}
            onPress={() => navigation.navigate('RevenueCatTest')}
          >
            <Text style={styles.devLinkText}>RevenueCat Test (Dev)</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowDetail: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  // Theme toggle
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  devLink: {
    alignItems: 'center',
    marginTop: 24,
  },
  devLinkText: {
    color: '#78716C',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
