import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedNumber } from './AnimatedNumber';
import { useTheme } from '../lib/theme';

interface ConfidenceRingProps {
  value: number;
  context: string;
  size?: number;
  strokeWidth?: number;
}

function getColor(value: number): string {
  if (value >= 70) return '#34d399';  // Warm mint
  if (value >= 40) return '#FBBF24';  // Golden amber
  return '#f87171';                   // Soft warm red
}

function getGlowColor(value: number): string {
  if (value >= 70) return 'rgba(52, 211, 153, 0.25)';  // Green glow
  if (value >= 40) return 'rgba(251, 191, 36, 0.25)';  // Golden glow
  return 'rgba(248, 113, 113, 0.25)';                   // Red glow
}

export function ConfidenceRing({
  value,
  context,
  size = 200,
  strokeWidth = 12,
}: ConfidenceRingProps) {
  const BRAND = useTheme();
  const clamped = Math.max(0, Math.min(100, value));
  const color = getColor(clamped);
  const glowColor = getGlowColor(clamped);
  const halfSize = size / 2;
  const innerRadius = halfSize - strokeWidth;

  // For 0-50%: only the right semicircle rotates from 180deg (hidden) to 0deg (half shown)
  // For 50-100%: right is fully visible, left rotates from 180deg to 0deg
  const rightRotation = clamped <= 50
    ? `${180 - (clamped / 50) * 180}deg`
    : '0deg';

  const leftRotation = clamped <= 50
    ? '180deg'
    : `${180 - ((clamped - 50) / 50) * 180}deg`;

  return (
    <View
      style={[styles.wrapper, {
        width: size + 24,
        height: size + 24,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Quit readiness ${clamped} percent. ${context}`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      {/* Subtle color-matched glow behind the ring */}
      <View style={[styles.glowCircle, {
        width: size + 20,
        height: size + 20,
        borderRadius: (size + 20) / 2,
        backgroundColor: glowColor,
      }]} />
      {/* Background track ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: BRAND.isDark ? '#292524' : '#E7E5E4',
            top: 12,
            left: 12,
          },
        ]}
      />

      {/* Right half mask — clips to right 50% of the circle */}
      <View
        style={[
          styles.halfMask,
          {
            width: halfSize,
            height: size,
            left: halfSize + 12,
            top: 12,
          },
        ]}
      >
        <View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: color,
              // Position so the full circle is anchored with its center at the left edge of the mask
              left: -halfSize,
              transform: [{ rotate: rightRotation }],
            },
          ]}
        />
      </View>

      {/* Left half mask — clips to left 50% of the circle */}
      <View
        style={[
          styles.halfMask,
          {
            width: halfSize,
            height: size,
            left: 12,
            top: 12,
          },
        ]}
      >
        <View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: color,
              // Position so the full circle is anchored with its center at the right edge of the mask
              left: 0,
              transform: [{ rotate: leftRotation }],
            },
          ]}
        />
      </View>

      {/* Center content */}
      <View
        style={[
          styles.center,
          {
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: innerRadius,
            top: strokeWidth + 12,
            left: strokeWidth + 12,
          },
        ]}
      >
        <AnimatedNumber
          value={clamped}
          suffix="%"
          style={[styles.valueText, { color }]}
        />
        <Text style={[styles.label, { color: BRAND.textSecondary }]}>How Ready You Are</Text>
        <Text style={[styles.context, { color: BRAND.textMuted }]} numberOfLines={2}>
          {context}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  ring: {
    position: 'absolute',
  },
  glowCircle: {
    position: 'absolute',
  },
  halfMask: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 13,
    marginTop: 2,
  },
  context: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
