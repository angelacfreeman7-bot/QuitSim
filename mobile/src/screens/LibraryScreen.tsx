import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useSimStore } from '../stores/useSimStore';
import { canSavePlan, canUseCouplesMode, FREE_PLAN_LIMIT } from '../lib/premium';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { PressableCard } from '../components/PressableCard';
import { BRAND } from '../lib/theme';
import * as Haptics from 'expo-haptics';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

export function LibraryScreen({ navigation }: any) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const {
    plans,
    deletePlan,
    lockPlan,
    couplesMode,
    toggleCouplesMode,
    setParams,
    simulate,
    profile,
    setProfile,
  } = useSimStore();

  const triggerUpgrade = (feature: string) => {
    setUpgradeFeature(feature);
    setShowUpgrade(true);
  };

  const loadPlan = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setParams(plan.params);
      simulate();
      navigation.navigate('Simulator');
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete Plan', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePlan(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <UpgradePrompt
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={upgradeFeature}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Saved Plans</Text>
          <View style={styles.couplesRow}>
            <Text style={styles.couplesLabel}>Couples</Text>
            {canUseCouplesMode() ? (
              <Switch
                value={couplesMode}
                onValueChange={toggleCouplesMode}
                trackColor={{ false: '#E7E5E4', true: '#4ade80' }}
                thumbColor="#fff"
              />
            ) : (
              <Pressable
                style={styles.proBadge}
                onPress={() => triggerUpgrade('Couples mode simulation')}
              >
                <Text style={styles.proBadgeText}>👑 Pro</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Partner Financials */}
        {couplesMode && profile.partner && (
          <View style={styles.partnerCard}>
            <Text style={styles.partnerTitle}>Partner's Financials</Text>
            <PartnerSlider
              label="Partner Salary"
              value={profile.partner.salary}
              min={0}
              max={300000}
              step={5000}
              onChange={(v) =>
                setProfile({ partner: { ...profile.partner!, salary: v } })
              }
            />
            <PartnerSlider
              label="Partner Savings"
              value={profile.partner.savings}
              min={0}
              max={500000}
              step={5000}
              onChange={(v) =>
                setProfile({ partner: { ...profile.partner!, savings: v } })
              }
            />
            <PartnerSlider
              label="Partner Expenses"
              value={profile.partner.monthlyExpenses}
              min={0}
              max={15000}
              step={250}
              onChange={(v) =>
                setProfile({
                  partner: { ...profile.partner!, monthlyExpenses: v },
                })
              }
            />
          </View>
        )}

        {/* Empty State */}
        {plans.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>No saved plans yet</Text>
            <Text style={styles.emptySubtext}>
              When you try different &ldquo;what if&rdquo; scenarios in the Explore tab, you can save your favorites here to compare them.
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Simulator')}
              accessibilityRole="button"
              accessibilityLabel="Create a simulation"
            >
              <Text style={styles.primaryButtonText}>Explore scenarios</Text>
            </Pressable>
          </View>
        ) : (
          /* Plan Cards */
          plans.map((plan) => (
            <PressableCard
              key={plan.id}
              onPress={() => loadPlan(plan.id)}
              style={[
                styles.card,
                plan.locked && styles.cardLocked,
              ]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.locked && <Text style={styles.lockIcon}>🔒</Text>}
                  </View>
                  <Text style={styles.planDate}>
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.badges}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {plan.result.quitConfidence}%
                    </Text>
                  </View>
                  <View style={[styles.badge, styles.badgeSecondary]}>
                    <Text style={styles.badgeText}>
                      {plan.result.runwayMonths}mo
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>Income change</Text>
                  <Text style={styles.statValue}>
                    {plan.params.incomeDropPct}%
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>New income</Text>
                  <Text style={styles.statValue}>
                    ${(plan.params.newMonthlyIncome / 1000).toFixed(1)}k
                  </Text>
                </View>
                <View style={styles.statCell}>
                  <Text style={styles.statLabel}>Survival rate</Text>
                  <Text style={styles.statValue}>
                    {plan.result.monteCarlo.successRate}%
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); lockPlan(plan.id); }}
                >
                  <Text style={styles.iconButtonText}>
                    {plan.locked ? '🔓' : '🔒'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.iconButton,
                    plan.locked && styles.iconButtonDisabled,
                  ]}
                  onPress={() => {
                    if (!plan.locked) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); confirmDelete(plan.id, plan.name); }
                  }}
                  disabled={plan.locked}
                >
                  <Text
                    style={[
                      styles.iconButtonText,
                      { color: plan.locked ? BRAND.textMuted : '#f87171' },
                    ]}
                  >
                    🗑️
                  </Text>
                </Pressable>
              </View>
            </PressableCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PartnerSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.partnerSlider}>
      <View style={styles.partnerSliderHeader}>
        <Text style={styles.partnerSliderLabel}>{label}</Text>
        <Text style={styles.partnerSliderValue}>{formatCurrency(value)}</Text>
      </View>
      <Slider
        style={{ width: '100%', height: 36 }}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onSlidingComplete={onChange}
        minimumTrackTintColor={BRAND.success}
        maximumTrackTintColor={BRAND.cardBorder}
        thumbTintColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.bg },
  scroll: { padding: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { color: BRAND.text, fontSize: 20, fontWeight: '700' },
  couplesRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  couplesLabel: { color: BRAND.textSecondary, fontSize: 12 },
  proBadge: {
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  proBadgeText: { color: '#eab308', fontSize: 11, fontWeight: '600' },

  // Partner card
  partnerCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  partnerTitle: { color: BRAND.text, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  partnerSlider: { marginBottom: 12 },
  partnerSliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  partnerSliderLabel: { color: BRAND.textSecondary, fontSize: 12 },
  partnerSliderValue: {
    color: BRAND.text,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.3 },
  emptyText: { color: BRAND.textSecondary, fontSize: 16, marginBottom: 4 },
  emptySubtext: { color: BRAND.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 24 },
  primaryButton: {
    backgroundColor: BRAND.primary,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Plan card
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  cardLocked: { borderColor: 'rgba(59, 130, 246, 0.3)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planName: { color: BRAND.text, fontSize: 15, fontWeight: '600' },
  lockIcon: { fontSize: 12 },
  planDate: { color: BRAND.textMuted, fontSize: 11, marginTop: 2 },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeSecondary: { backgroundColor: BRAND.cardBorder },
  badgeText: { color: BRAND.text, fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },

  // Stats grid
  statsGrid: { flexDirection: 'row', marginBottom: 12 },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { color: BRAND.textMuted, fontSize: 10, marginBottom: 2 },
  statValue: { color: BRAND.text, fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },

  // Actions
  actions: { flexDirection: 'row', gap: 8 },
  loadButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadButtonText: { color: BRAND.text, fontSize: 13, fontWeight: '500' },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDisabled: { opacity: 0.4 },
  iconButtonText: { fontSize: 16 },
});
