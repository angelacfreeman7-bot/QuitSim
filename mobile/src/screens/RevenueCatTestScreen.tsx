import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  loadSubscriptionStatus,
  purchaseUpgrade,
  restorePurchases,
  ENTITLEMENT_ID,
  PRO_PRODUCT_ID,
  SubscriptionStatus,
} from '../lib/premium';
import { useTheme } from '../lib/theme';

export function RevenueCatTestScreen() {
  const BRAND = useTheme();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState('');

  const handleLoad = async () => {
    setLoading('load');
    try {
      const result = await loadSubscriptionStatus();
      setStatus(result);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? String(e));
    }
    setLoading('');
  };

  const handlePurchase = async () => {
    setLoading('purchase');
    try {
      const success = await purchaseUpgrade();
      if (success) {
        Alert.alert('Success', 'Purchase completed! Refreshing status...');
        await handleLoad();
      } else {
        Alert.alert('Not Completed', 'Purchase was cancelled or no package found.');
      }
    } catch (e: any) {
      Alert.alert('Purchase Error', e.message ?? String(e));
    }
    setLoading('');
  };

  const handleRestore = async () => {
    setLoading('restore');
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Restored', 'Pro subscription restored! Refreshing status...');
        await handleLoad();
      } else {
        Alert.alert('Nothing Found', 'No previous purchases to restore.');
      }
    } catch (e: any) {
      Alert.alert('Restore Error', e.message ?? String(e));
    }
    setLoading('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: BRAND.text }]}>RevenueCat Test</Text>
        <Text style={[styles.subtitle, { color: BRAND.textSecondary }]}>Subscription diagnostics</Text>

        {/* Config info */}
        <View style={[styles.card, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: BRAND.text }]}>Configuration</Text>
          <Row label="Entitlement" value={ENTITLEMENT_ID} />
          <Row label="Product ID" value={PRO_PRODUCT_ID} />
        </View>

        {/* Status */}
        <View style={[styles.card, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: BRAND.text }]}>Status</Text>
          {status ? (
            <>
              <Row
                label="Premium"
                value={status.isPremium ? 'YES' : 'NO'}
                color={status.isPremium ? BRAND.success : BRAND.danger}
              />
              <Row
                label="Offering Found"
                value={status.currentOfferingAvailable ? 'YES' : 'NO'}
                color={status.currentOfferingAvailable ? BRAND.success : BRAND.danger}
              />
              <Row
                label="Annual Package"
                value={status.annualPackage ? 'Found' : 'Not found'}
                color={status.annualPackage ? BRAND.success : BRAND.warning}
              />
              <Text style={[styles.statusText, { color: BRAND.textMuted }]}>{status.statusText}</Text>
            </>
          ) : (
            <Text style={[styles.hint, { color: BRAND.textMuted }]}>Tap "Load RevenueCat" to fetch status</Text>
          )}
        </View>

        {/* Actions */}
        <ActionButton
          label="Load RevenueCat"
          onPress={handleLoad}
          loading={loading === 'load'}
          style={[styles.primaryBtn, { backgroundColor: BRAND.primary }]}
          textStyle={styles.primaryBtnText}
        />
        <ActionButton
          label="Buy Annual"
          onPress={handlePurchase}
          loading={loading === 'purchase'}
          disabled={!status?.annualPackage}
          style={[styles.secondaryBtn, { backgroundColor: BRAND.success }]}
          textStyle={styles.secondaryBtnText}
        />
        <ActionButton
          label="Restore Purchases"
          onPress={handleRestore}
          loading={loading === 'restore'}
          style={[styles.outlineBtn, { borderColor: BRAND.cardBorder }]}
          textStyle={[styles.outlineBtnText, { color: BRAND.text }]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  const BRAND = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: BRAND.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: color || BRAND.text }]}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  loading,
  disabled,
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  style: any;
  textStyle: any;
}) {
  return (
    <Pressable
      style={[style, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={textStyle}>{loading ? 'Loading...' : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 24 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: '600', fontFamily: 'Courier' },
  statusText: { fontSize: 11, marginTop: 8 },
  hint: { fontSize: 12, fontStyle: 'italic' },
  primaryBtn: {
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryBtn: {
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  outlineBtn: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  outlineBtnText: { fontSize: 15, fontWeight: '500' },
  btnDisabled: { opacity: 0.4 },
});
