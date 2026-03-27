import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBenchmarks } from '../lib/benchmarks';
import { useTheme } from '../lib/theme';

interface Props {
  salary: number;
  savings: number;
  monthlyExpenses: number;
  runwayMonths: number;
}

const EMOJIS = ['📊', '🏃', '🌟'];

export function BenchmarkCard({ salary, savings, monthlyExpenses, runwayMonths }: Props) {
  const BRAND = useTheme();
  const benchmarks = getBenchmarks(salary, savings, monthlyExpenses, runwayMonths);

  return (
    <View style={[styles.card, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
      <Text style={[styles.title, { color: BRAND.text }]}>How You&apos;re Doing</Text>
      <Text style={[styles.subtitle, { color: BRAND.textSecondary }]}>Compared to others earning a similar amount</Text>

      {benchmarks.map((b, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.emoji}>{EMOJIS[i]}</Text>
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: BRAND.text }]}>{b.label}</Text>
            <Text style={[styles.context, { color: BRAND.textSecondary }]}>{b.context}</Text>
          </View>
        </View>
      ))}

      <Text style={[styles.disclaimer, { color: BRAND.textMuted }]}>
        These are rough averages from public data — everyone&apos;s situation is different
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  emoji: {
    fontSize: 18,
    marginTop: 1,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
  },
  context: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
