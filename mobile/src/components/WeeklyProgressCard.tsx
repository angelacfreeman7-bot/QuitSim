import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND } from '../lib/theme';

interface WeeklyProgressCardProps {
  confidenceScore: number;
  confidenceChange: number; // +/- since last week
  runwayMonths: number;
  runwayChange: number;
  freedomDate: string | null;
  streakDays: number;
  weekNumber: number;
}

function formatFreedomDate(iso: string | null): string {
  if (!iso) return 'Calculating...';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getScoreColor(score: number): string {
  if (score >= 70) return BRAND.success;
  if (score >= 40) return BRAND.warning;
  return BRAND.sunset;
}

function getChangeLabel(change: number): string {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return '—';
}

function getChangeColor(change: number): string {
  if (change > 0) return BRAND.success;
  if (change < 0) return BRAND.danger;
  return BRAND.textMuted;
}

export const WeeklyProgressCard = forwardRef<View, WeeklyProgressCardProps>(
  ({ confidenceScore, confidenceChange, runwayMonths, runwayChange, freedomDate, streakDays, weekNumber }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.branding}>QuitSim</Text>
            <Text style={styles.weekLabel}>Week {weekNumber}</Text>
          </View>

          {/* Main score */}
          <View style={styles.scoreSection}>
            <Text style={[styles.bigScore, { color: getScoreColor(confidenceScore) }]}>
              {confidenceScore}%
            </Text>
            {confidenceChange !== 0 && (
              <View style={[styles.changeBadge, { backgroundColor: getChangeColor(confidenceChange) + '15' }]}>
                <Text style={[styles.changeText, { color: getChangeColor(confidenceChange) }]}>
                  {getChangeLabel(confidenceChange)} this week
                </Text>
              </View>
            )}
            <Text style={styles.scoreSubtitle}>Freedom Confidence</Text>
          </View>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🌅</Text>
              <Text style={styles.statValue}>{formatFreedomDate(freedomDate)}</Text>
              <Text style={styles.statLabel}>Freedom Date</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🛤️</Text>
              <View style={styles.statRow}>
                <Text style={styles.statValue}>{runwayMonths} mo</Text>
                {runwayChange !== 0 && (
                  <Text style={[styles.statChange, { color: getChangeColor(runwayChange) }]}>
                    {getChangeLabel(runwayChange)}
                  </Text>
                )}
              </View>
              <Text style={styles.statLabel}>Runway</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{streakDays} days</Text>
              <Text style={styles.statLabel}>Challenge Streak</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>quitsim.it.com</Text>
          </View>
        </View>
      </View>
    );
  }
);

WeeklyProgressCard.displayName = 'WeeklyProgressCard';

const styles = StyleSheet.create({
  card: {
    width: 375,
    height: 520,
    backgroundColor: BRAND.bg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  inner: {
    flex: 1,
    padding: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  branding: {
    color: BRAND.text,
    fontSize: 18,
    fontWeight: '800',
  },
  weekLabel: {
    color: BRAND.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  bigScore: {
    fontSize: 72,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 78,
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreSubtitle: {
    color: BRAND.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  statsGrid: {
    gap: 10,
    flex: 1,
  },
  statCard: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statEmoji: {
    fontSize: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statValue: {
    color: BRAND.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statChange: {
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    color: BRAND.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: BRAND.textMuted,
    fontSize: 12,
  },
});
