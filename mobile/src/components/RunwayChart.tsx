import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MonthData } from '../types';
import { BRAND } from '../lib/theme';

const CHART_HEIGHT = 180;
const BAR_COUNT = 36;

const formatCurrency = (v: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: Math.abs(v) >= 1_000_000 ? 'compact' : 'standard',
  }).format(v);

function getRunwaySummary(months: MonthData[]): string {
  // Runway = first month where totalNetWorth <= 0, or full length if never
  const depletionIndex = months.findIndex((m) => m.totalNetWorth <= 0);
  const runway = depletionIndex === -1 ? months.length : depletionIndex;

  if (runway === 0) return 'Right now your bills are higher than what you have saved \u2014 check the tips below for ideas';
  if (runway >= 36) return 'Your money could last 3+ years without a paycheck \u2014 that\u2019s amazing';
  if (runway >= 24)
    return `Your money could cover about ${runway} months \u2014 that\u2019s a really strong position`;
  if (runway >= 12)
    return `You\u2019re covered for about ${runway} months \u2014 a few tweaks could stretch this even further`;
  return `You have about ${runway} months of coverage \u2014 every extra month you add makes a big difference`;
}

interface RunwayChartProps {
  months: MonthData[];
}

export function RunwayChart({ months }: RunwayChartProps) {
  if (!months || months.length === 0) return null;

  const values = months.slice(0, BAR_COUNT).map((m) => m.totalNetWorth);
  const maxVal = Math.max(...values.map(Math.abs), 1); // avoid division by zero

  // Determine where the zero line sits.
  // If all positive, zero line is at the bottom.
  // If all negative, zero line is at the top.
  // Otherwise, proportional.
  const hasNeg = values.some((v) => v < 0);
  const hasPos = values.some((v) => v > 0);

  const maxPositive = Math.max(...values, 0);
  const maxNegative = Math.abs(Math.min(...values, 0));
  const totalRange = maxPositive + maxNegative || 1;

  // Zero line position from top (as fraction of chart height)
  const zeroLineFromTop = maxPositive / totalRange;

  const barWidth = 100 / BAR_COUNT; // percentage

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>How Long Your Money Lasts</Text>
      <View style={styles.chartOuter}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {maxPositive > 0 && (
            <Text style={styles.yLabel}>{formatCurrency(maxPositive)}</Text>
          )}
          <View style={{ flex: 1 }} />
          {maxNegative > 0 && (
            <Text style={styles.yLabel}>{formatCurrency(-maxNegative)}</Text>
          )}
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Zero line */}
          <View
            style={[
              styles.zeroLine,
              { top: `${zeroLineFromTop * 100}%` as any },
            ]}
          />

          {/* Bars */}
          {values.map((val, i) => {
            const isPositive = val > 0;
            const barHeightFrac = Math.abs(val) / totalRange;
            const barHeightPx = barHeightFrac * CHART_HEIGHT;

            // Position: positive bars grow upward from zero line,
            // negative bars grow downward from zero line.
            const topPct = isPositive
              ? (zeroLineFromTop * CHART_HEIGHT - barHeightPx)
              : zeroLineFromTop * CHART_HEIGHT;

            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: `${(i / BAR_COUNT) * 100}%` as any,
                  width: `${barWidth}%` as any,
                  top: topPct,
                  height: Math.max(barHeightPx, 1),
                  backgroundColor: isPositive ? '#34d399' : '#f87171',
                  borderRadius: 1,
                }}
              />
            );
          })}

          {/* X-axis labels */}
          <View style={styles.xAxis}>
            <Text style={styles.xLabel}>Now</Text>
            <Text style={styles.xLabel}>1yr</Text>
            <Text style={styles.xLabel}>2yr</Text>
            <Text style={styles.xLabel}>3yr</Text>
          </View>
        </View>
      </View>

      <Text style={styles.summary}>{getRunwaySummary(months)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  chartOuter: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3EDE7',
    padding: 12,
    paddingBottom: 28, // room for x-axis labels
  },
  yAxis: {
    width: 52,
    marginRight: 6,
    justifyContent: 'space-between',
  },
  yLabel: {
    color: '#78716C',
    fontSize: 9,
    fontVariant: ['tabular-nums'],
  },
  chartArea: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  zeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderColor: '#D6D3D1',
    borderStyle: 'dashed',
  },
  xAxis: {
    position: 'absolute',
    bottom: -22,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xLabel: {
    color: '#78716C',
    fontSize: 10,
  },
  summary: {
    color: '#A8A29E',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 17,
  },
});
