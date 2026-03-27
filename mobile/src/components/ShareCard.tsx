import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../lib/theme';

interface ShareCardProps {
  quitConfidence: number;
  runwayMonths: number;
  stressTestPct: number;
  freedomDate: string | null;
}

function formatFreedomDate(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export const ShareCard = forwardRef<View, ShareCardProps>(
  ({ quitConfidence, runwayMonths, stressTestPct, freedomDate }, ref) => {
    const BRAND = useTheme();

    const getConfidenceColor = (confidence: number): string => {
      if (confidence >= 70) return BRAND.success;
      if (confidence >= 40) return BRAND.warning;
      return BRAND.danger;
    };

    const confidenceColor = getConfidenceColor(quitConfidence);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={[styles.card, { backgroundColor: BRAND.bg, borderColor: BRAND.cardBorder }]}
      >
        <View style={styles.inner}>
          <Text style={[styles.branding, { color: BRAND.textSecondary }]}>QuitSim</Text>

          <Text style={[styles.bigNumber, { color: confidenceColor }]}>
            {quitConfidence}%
          </Text>
          <Text style={[styles.scoreLabel, { color: BRAND.textMuted }]}>Quit Readiness Score</Text>

          <View style={[styles.divider, { backgroundColor: BRAND.cardBorder }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: BRAND.text }]}>{runwayMonths}</Text>
              <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>Runway Mo.</Text>
            </View>
            <View style={[styles.statSeparator, { backgroundColor: BRAND.cardBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: BRAND.text }]}>{stressTestPct}%</Text>
              <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>Stress Test</Text>
            </View>
            <View style={[styles.statSeparator, { backgroundColor: BRAND.cardBorder }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: BRAND.text }]}>{formatFreedomDate(freedomDate)}</Text>
              <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>Freedom Date</Text>
            </View>
          </View>

          <Text style={[styles.tagline, { color: BRAND.textSecondary }]}>
            Find your freedom date at quitsim.it.com
          </Text>
        </View>
      </View>
    );
  }
);

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  card: {
    width: 375,
    height: 500,
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  branding: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  bigNumber: {
    fontSize: 96,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 100,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 32,
  },
  divider: {
    width: 60,
    height: 1,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statSeparator: {
    width: 1,
    height: 32,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '400',
  },
});
