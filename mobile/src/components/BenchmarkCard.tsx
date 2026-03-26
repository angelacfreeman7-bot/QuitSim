import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getBenchmarks } from '../lib/benchmarks';
import { BRAND } from '../lib/theme';

interface Props {
  salary: number;
  savings: number;
  monthlyExpenses: number;
  runwayMonths: number;
}

const EMOJIS = ['📊', '🏃', '🌟'];

export function BenchmarkCard({ salary, savings, monthlyExpenses, runwayMonths }: Props) {
  const benchmarks = getBenchmarks(salary, savings, monthlyExpenses, runwayMonths);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How You&apos;re Doing</Text>
      <Text style={styles.subtitle}>Compared to others earning a similar amount</Text>

      {benchmarks.map((b, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.emoji}>{EMOJIS[i]}</Text>
          <View style={styles.rowText}>
            <Text style={styles.label}>{b.label}</Text>
            <Text style={styles.context}>{b.context}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.disclaimer}>
        These are rough averages from public data — everyone&apos;s situation is different
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3EDE7',
  },
  title: {
    color: BRAND.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    color: BRAND.textSecondary,
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
    color: BRAND.text,
    fontSize: 14,
    lineHeight: 20,
  },
  context: {
    color: BRAND.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  disclaimer: {
    color: BRAND.textMuted,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});
