import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND } from '../lib/theme';

interface ShareCardProps {
  quitConfidence: number;
  runwayMonths: number;
  stressTestPct: number;
  freedomDate: string | null;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 70) return BRAND.success;
  if (confidence >= 40) return BRAND.warning;
  return BRAND.danger;
}

function formatFreedomDate(iso: string | null): string {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export const ShareCard = forwardRef<View, ShareCardProps>(
  ({ quitConfidence, runwayMonths, stressTestPct, freedomDate }, ref) => {
    const confidenceColor = getConfidenceColor(quitConfidence);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={styles.card}
      >
        <View style={styles.inner}>
          <Text style={styles.branding}>QuitSim</Text>

          <Text style={[styles.bigNumber, { color: confidenceColor }]}>
            {quitConfidence}%
          </Text>
          <Text style={styles.scoreLabel}>Quit Readiness Score</Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{runwayMonths}</Text>
              <Text style={styles.statLabel}>Runway Mo.</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stressTestPct}%</Text>
              <Text style={styles.statLabel}>Stress Test</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatFreedomDate(freedomDate)}</Text>
              <Text style={styles.statLabel}>Freedom Date</Text>
            </View>
          </View>

          <Text style={styles.tagline}>
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
    backgroundColor: BRAND.bg,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
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
    color: BRAND.textSecondary,
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
    color: BRAND.textMuted,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 32,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: BRAND.cardBorder,
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
    color: BRAND.text,
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  statLabel: {
    color: BRAND.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  statSeparator: {
    width: 1,
    height: 32,
    backgroundColor: BRAND.cardBorder,
  },
  tagline: {
    color: BRAND.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
});
