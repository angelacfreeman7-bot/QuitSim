import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../lib/theme';

interface Props {
  currentConfidence: number;
  currentRunway: number;
  previousConfidence: number;
  previousRunway: number;
  recordedAt: string;
}

export function WeeklyProgressBanner({
  currentConfidence,
  previousConfidence,
  currentRunway,
  previousRunway,
  recordedAt,
}: Props) {
  const confDelta = currentConfidence - previousConfidence;
  const runwayDelta = currentRunway - previousRunway;

  // Don't show if nothing changed
  if (confDelta === 0 && runwayDelta === 0) return null;

  const isPositive = confDelta > 0;
  const isNegative = confDelta < 0;

  const daysAgo = Math.floor(
    (Date.now() - new Date(recordedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only show if snapshot is 3+ days old (meaningful comparison)
  if (daysAgo < 3) return null;

  const emoji = isPositive ? '📈' : isNegative ? '📉' : '➡️';
  const color = isPositive ? BRAND.success : isNegative ? BRAND.sunset : BRAND.textSecondary;
  const bgColor = isPositive
    ? 'rgba(16, 185, 129, 0.08)'
    : isNegative
      ? 'rgba(249, 115, 22, 0.08)'
      : 'rgba(0,0,0,0.03)';
  const borderColor = isPositive
    ? 'rgba(16, 185, 129, 0.20)'
    : isNegative
      ? 'rgba(249, 115, 22, 0.20)'
      : BRAND.cardBorder;

  const timeLabel = daysAgo >= 7 ? 'Since last week' : `Last ${daysAgo} days`;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.content}>
        <Text style={styles.timeLabel}>{timeLabel}</Text>
        <View style={styles.deltaRow}>
          {confDelta !== 0 && (
            <View style={styles.chip}>
              <Ionicons
                name={isPositive ? 'arrow-up' : 'arrow-down'}
                size={12}
                color={color}
              />
              <Text style={[styles.chipText, { color }]}>
                {Math.abs(confDelta)}% confidence
              </Text>
            </View>
          )}
          {runwayDelta !== 0 && (
            <View style={styles.chip}>
              <Ionicons
                name={runwayDelta > 0 ? 'arrow-up' : 'arrow-down'}
                size={12}
                color={runwayDelta > 0 ? BRAND.success : BRAND.sunset}
              />
              <Text style={[styles.chipText, { color: runwayDelta > 0 ? BRAND.success : BRAND.sunset }]}>
                {Math.abs(runwayDelta)} month{Math.abs(runwayDelta) !== 1 ? 's' : ''} runway
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 10,
  },
  emoji: { fontSize: 20 },
  content: { flex: 1 },
  timeLabel: {
    color: BRAND.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  deltaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
