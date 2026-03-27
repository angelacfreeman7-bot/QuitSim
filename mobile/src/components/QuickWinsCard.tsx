import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';
import { UserProfile, SimParams, SimResult } from '../types';
import { computeQuickWins, QuickWin } from '../lib/quickWins';
import * as Haptics from 'expo-haptics';

interface Props {
  profile: UserProfile;
  params: SimParams;
  currentResult: SimResult;
  onTryScenario?: (profileOverrides?: Partial<UserProfile>, paramOverrides?: Partial<SimParams>) => void;
}

export function QuickWinsCard({ profile, params, currentResult, onTryScenario }: Props) {
  const BRAND = useTheme();
  const wins = useMemo(
    () => computeQuickWins(profile, params, currentResult),
    [profile, params, currentResult],
  );

  if (wins.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.emptyCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: BRAND.text }]}>You're in great shape</Text>
          <Text style={[styles.emptyText, { color: BRAND.textSecondary }]}>
            Your numbers look strong. Keep doing what you're doing.
          </Text>
        </View>
      </View>
    );
  }

  const hero = wins[0];
  const rest = wins.slice(1);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: BRAND.textMuted }]}>YOUR BIGGEST LEVER</Text>

      {/* Hero card — the #1 thing they can do */}
      <Pressable
        style={[styles.heroCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onTryScenario?.(hero.profileOverrides, hero.paramOverrides);
        }}
      >
        <View style={styles.heroHeader}>
          <Text style={styles.heroEmoji}>{hero.emoji}</Text>
          <View style={styles.heroBadge}>
            <Ionicons name="trending-up" size={12} color={BRAND.success} />
            <Text style={[styles.heroBadgeText, { color: BRAND.success }]}>+{hero.impact}% confidence</Text>
          </View>
        </View>

        <Text style={[styles.heroTitle, { color: BRAND.text }]}>{hero.title}</Text>
        <Text style={[styles.heroDetail, { color: BRAND.textSecondary }]}>{hero.detail}</Text>

        {/* Before → After comparison */}
        <View style={[styles.comparison, { backgroundColor: BRAND.bg }]}>
          <View style={styles.compSide}>
            <Text style={[styles.compLabel, { color: BRAND.textMuted }]}>Now</Text>
            <Text style={[styles.compValue, { color: BRAND.text }]}>{currentResult.quitConfidence}%</Text>
            <Text style={[styles.compSub, { color: BRAND.textSecondary }]}>{currentResult.runwayMonths} months</Text>
          </View>
          <View style={styles.compArrow}>
            <Ionicons name="arrow-forward" size={18} color={BRAND.success} />
          </View>
          <View style={styles.compSide}>
            <Text style={[styles.compLabel, { color: BRAND.textMuted }]}>After</Text>
            <Text style={[styles.compValue, { color: BRAND.success }]}>{hero.newConfidence}%</Text>
            <Text style={[styles.compSub, { color: BRAND.textSecondary }]}>
              {currentResult.runwayMonths + hero.runwayDelta} months
            </Text>
          </View>
        </View>

        <View style={styles.heroCta}>
          <Text style={[styles.heroCtaText, { color: BRAND.primary }]}>Try this scenario</Text>
          <Ionicons name="arrow-forward" size={14} color={BRAND.primary} />
        </View>
      </Pressable>

      {/* Other moves */}
      {rest.length > 0 && (
        <>
          <Text style={[styles.otherLabel, { color: BRAND.textSecondary }]}>Other moves that help</Text>
          {rest.map((win: QuickWin) => (
            <Pressable
              key={win.id}
              style={[styles.winCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTryScenario?.(win.profileOverrides, win.paramOverrides);
              }}
            >
              <Text style={styles.winEmoji}>{win.emoji}</Text>
              <View style={styles.winContent}>
                <Text style={[styles.winTitle, { color: BRAND.text }]}>{win.title}</Text>
                <Text style={[styles.winDetail, { color: BRAND.textSecondary }]}>{win.detail}</Text>
              </View>
              <View style={styles.impactBadge}>
                <Text style={[styles.impactText, { color: BRAND.success }]}>+{win.impact}%</Text>
              </View>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  // Hero card
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroEmoji: { fontSize: 28 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700' },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroDetail: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },

  // Before → After
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  compSide: { flex: 1, alignItems: 'center' },
  compLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  compValue: { fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] },
  compSub: { fontSize: 11, marginTop: 2 },
  compArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CTA
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroCtaText: { fontSize: 14, fontWeight: '600' },

  // Other moves
  otherLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  winCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  winEmoji: { fontSize: 22, marginRight: 12 },
  winContent: { flex: 1 },
  winTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  winDetail: { fontSize: 12 },
  impactBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  impactText: { fontSize: 13, fontWeight: '700' },

  // Empty
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
