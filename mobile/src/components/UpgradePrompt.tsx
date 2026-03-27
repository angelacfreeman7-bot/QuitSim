import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PREMIUM_FEATURES,
  PRO_PRICE,
  purchaseUpgrade,
  restorePurchases,
} from '../lib/premium';
import { useTheme } from '../lib/theme';
import * as Haptics from 'expo-haptics';

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  feature?: string;
}

const featureList = Object.values(PREMIUM_FEATURES);

const FEATURE_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'infinite-outline',
  'analytics-outline',
  'people-outline',
  'bulb-outline',
  'document-text-outline',
];

export function UpgradePrompt({ visible, onClose, feature }: UpgradePromptProps) {
  const BRAND = useTheme();

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await purchaseUpgrade();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Welcome to Pro!', 'All features are now unlocked.');
      onClose();
    } else {
      Alert.alert(
        'Purchase Failed',
        'Something went wrong. Please try again or restore a previous purchase.'
      );
    }
  };

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      Alert.alert('Restored!', 'Your Pro subscription is active.');
      onClose();
    } else {
      Alert.alert('Nothing to Restore', 'No previous purchases found.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: BRAND.bg }]}>
        {/* Close */}
        <Pressable style={[styles.closeButton, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]} onPress={onClose} accessibilityLabel="Close">
          <Ionicons name="close" size={18} color={BRAND.textMuted} />
        </Pressable>

        {/* Header gradient */}
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.08)', 'transparent']}
          style={styles.headerGradient}
        />

        {/* Header */}
        <View style={[styles.crownBubble, { backgroundColor: BRAND.sunsetLight }]}>
          <Text style={styles.crown}>👑</Text>
        </View>
        <Text style={[styles.title, { color: BRAND.text }]}>Unlock Your Full Potential</Text>
        <Text style={[styles.subtitle, { color: BRAND.textSecondary }]}>Get the complete toolkit to plan your freedom</Text>
        <Text style={[styles.price, { color: BRAND.sunset }]}>{PRO_PRICE}</Text>

        {feature && (
          <View style={[styles.featureHighlight, { backgroundColor: BRAND.sunsetLight }]}>
            <Ionicons name="lock-open-outline" size={14} color={BRAND.sunset} />
            <Text style={[styles.featureHighlightText, { color: BRAND.sunset }]}>{feature}</Text>
          </View>
        )}

        {/* Feature list */}
        <View style={styles.featureList}>
          {featureList.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIconBubble, { backgroundColor: BRAND.primaryLight }]}>
                <Ionicons name={FEATURE_ICONS[i] || 'checkmark'} size={16} color={BRAND.primary} />
              </View>
              <Text style={[styles.featureText, { color: BRAND.text }]}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Free vs Pro comparison */}
        <View style={[styles.comparison, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <View style={styles.compCol}>
            <Text style={[styles.compHeader, { color: BRAND.textMuted }]}>Free</Text>
            <Text style={[styles.compItem, { color: BRAND.textSecondary }]}>3 saved plans</Text>
            <Text style={[styles.compItem, { color: BRAND.textSecondary }]}>100 simulations</Text>
            <Text style={[styles.compItem, { color: BRAND.textSecondary }]}>Solo mode</Text>
          </View>
          <View style={[styles.compDivider, { backgroundColor: BRAND.cardBorder }]} />
          <View style={styles.compCol}>
            <Text style={[styles.compHeader, { color: BRAND.sunset }]}>Pro</Text>
            <Text style={[styles.compItem, styles.compItemPro, { color: BRAND.text }]}>Unlimited plans</Text>
            <Text style={[styles.compItem, styles.compItemPro, { color: BRAND.text }]}>500 simulations</Text>
            <Text style={[styles.compItem, styles.compItemPro, { color: BRAND.text }]}>Couples mode</Text>
          </View>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.purchaseButton, pressed && styles.purchasePressed]}
          onPress={handlePurchase}
        >
          <LinearGradient
            colors={[BRAND.sunset, '#EA580C']}
            style={styles.purchaseGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="star" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.purchaseText}>Upgrade for {PRO_PRICE}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={styles.restoreButton} onPress={handleRestore}>
          <Text style={[styles.restoreText, { color: BRAND.textMuted }]}>Restore Purchase</Text>
        </Pressable>

        <Text style={[styles.legalText, { color: BRAND.textMuted }]}>
          Payment will be charged to your Apple ID account. Subscription
          automatically renews unless cancelled at least 24 hours before the
          end of the current period.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  crownBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crown: { fontSize: 36 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  featureHighlightText: { fontSize: 13, fontWeight: '600' },
  featureList: { width: '100%', marginBottom: 16, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: { fontSize: 14, fontWeight: '500', flex: 1 },
  comparison: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  compCol: { flex: 1, alignItems: 'center', gap: 6 },
  compDivider: { width: 1 },
  compHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  compItem: { fontSize: 13 },
  compItemPro: { fontWeight: '600' },
  purchaseButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  purchasePressed: { opacity: 0.9 },
  purchaseGradient: {
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  restoreButton: { marginBottom: 16 },
  restoreText: { fontSize: 13 },
  legalText: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 16,
  },
});
