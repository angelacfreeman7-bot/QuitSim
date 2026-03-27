import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { requestNotificationPermission, scheduleAllNotifications } from '../lib/notifications';
import * as Haptics from 'expo-haptics';

interface NotificationPromptProps {
  visible: boolean;
  onDismiss: () => void;
}

export function NotificationPrompt({ visible, onDismiss }: NotificationPromptProps) {
  const BRAND = useTheme();

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const granted = await requestNotificationPermission();
    if (granted) {
      await scheduleAllNotifications();
    }
    onDismiss();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: BRAND.card }]}>
          <View style={styles.iconRow}>
            <View style={[styles.iconBubble, { backgroundColor: BRAND.sunsetLight }]}>
              <Ionicons name="notifications" size={28} color={BRAND.sunset} />
            </View>
          </View>

          <Text style={[styles.title, { color: BRAND.text }]}>Stay on track</Text>
          <Text style={[styles.subtitle, { color: BRAND.textSecondary }]}>
            Get gentle reminders for daily challenges, weekly progress updates, and tips to move your freedom date closer.
          </Text>

          <View style={styles.features}>
            <FeatureRow icon="flash-outline" text="Daily challenge reminders" />
            <FeatureRow icon="trending-up-outline" text="Weekly progress check-ins" />
            <FeatureRow icon="heart-outline" text="Encouraging nudges if you're away" />
          </View>

          <Pressable
            style={({ pressed }) => [styles.enableButton, { backgroundColor: BRAND.sunset }, pressed && styles.enablePressed]}
            onPress={handleEnable}
            accessibilityRole="button"
            accessibilityLabel="Enable notifications"
          >
            <Ionicons name="notifications-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.enableText}>Enable Notifications</Text>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip for now"
          >
            <Text style={[styles.skipText, { color: BRAND.textMuted }]}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function FeatureRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const BRAND = useTheme();
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={18} color={BRAND.primary} />
      <Text style={[styles.featureText, { color: BRAND.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  iconRow: {
    marginBottom: 16,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  features: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  enableButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  enablePressed: {
    opacity: 0.9,
  },
  enableText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
