import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { BRAND } from '../lib/theme';

interface Assumption {
  id: string;
  label: string;
  warning: string;
  defaultOn: boolean;
}

const ASSUMPTIONS: Assumption[] = [
  {
    id: 'no-taxes',
    label: 'Taxes aren\u2019t included',
    warning:
      'If you have money in a retirement account from work (like a 401k), you\u2019ll likely owe taxes when you take it out \u2014 and possibly a penalty if you\u2019re under 59\u00BD. This means your money could run out 15\u201330% sooner than shown here.',
    defaultOn: true,
  },
  {
    id: 'no-healthcare',
    label: 'Health insurance isn\u2019t included',
    warning:
      'If you quit, you lose your employer\u2019s health plan. Buying your own can cost $500\u2013$1,000+ per month. This is a major expense most people forget about \u2014 make sure to factor it into your monthly spending.',
    defaultOn: true,
  },
  {
    id: 'inflation-3pct',
    label: 'Prices going up (inflation)',
    warning:
      'We assume everyday prices go up about 3% each year. But recently it\u2019s been higher (5\u20138%). That means groceries, rent, and gas could cost more than expected, so your savings might not stretch as far.',
    defaultOn: true,
  },
  {
    id: 'no-severance',
    label: 'No unemployment benefits',
    warning:
      'If you quit on your own (rather than being laid off), you typically can\u2019t collect unemployment checks. This model assumes you\u2019ll have zero income from the government after quitting.',
    defaultOn: true,
  },
  {
    id: 'steady-returns',
    label: 'Investments don\u2019t always go up',
    warning:
      'We assume your investments grow steadily each year, but in real life the stock market can drop 30\u201350% in a bad year. If that happens right after you quit, it\u2019s extra painful because you\u2019re spending money you can\u2019t earn back.',
    defaultOn: true,
  },
];

export function AssumptionsCard() {
  const [expanded, setExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>What This Doesn&apos;t Include</Text>
          <Text style={styles.headerSubtitle}>
            {ASSUMPTIONS.length} things to keep in mind
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.list}>
          {ASSUMPTIONS.map((a) => (
            <View key={a.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <Switch
                  value={acknowledged[a.id] ?? a.defaultOn}
                  onValueChange={(v) =>
                    setAcknowledged((prev) => ({ ...prev, [a.id]: v }))
                  }
                  trackColor={{ false: '#E7E5E4', true: '#eab30840' }}
                  thumbColor={
                    acknowledged[a.id] ?? a.defaultOn ? '#F59E0B' : '#78716C'
                  }
                />
                <Text style={styles.itemLabel}>{a.label}</Text>
              </View>
              <Text style={styles.itemWarning}>{a.warning}</Text>
            </View>
          ))}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              This app gives you a helpful starting point, not a complete financial plan. Before making any big decisions, it&apos;s a good idea to talk to a financial advisor who can look at your full picture.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BRAND.warningLight,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  headerIcon: { fontSize: 18 },
  headerTitle: { color: BRAND.warning, fontSize: 14, fontWeight: '600' },
  headerSubtitle: { color: BRAND.textSecondary, fontSize: 11, marginTop: 1 },
  chevron: { color: BRAND.textSecondary, fontSize: 12 },

  list: { paddingHorizontal: 14, paddingBottom: 14 },
  item: {
    borderTopWidth: 1,
    borderTopColor: BRAND.cardBorder,
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  itemLabel: { color: BRAND.text, fontSize: 13, fontWeight: '500', flex: 1 },
  itemWarning: { color: BRAND.textSecondary, fontSize: 11, lineHeight: 16, marginLeft: 52 },

  summaryBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  summaryText: { color: '#f87171', fontSize: 11, lineHeight: 16 },
});
