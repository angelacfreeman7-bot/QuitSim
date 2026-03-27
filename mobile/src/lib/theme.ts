// QuitSim — warm, light, inviting
// This app is about freedom, beaches, and sunshine.
// The design should feel like opening a window on a sunny day.

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

// ─── Theme preference type ───
export type ThemePreference = 'light' | 'dark' | 'system';

// ─── Brand color shape ───
export interface BrandColors {
  primary: string;
  primaryLight: string;
  primaryBorder: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  sunset: string;
  sunsetLight: string;
  golden: string;
  goldenLight: string;
  warmTeal: string;
  coral: string;
  warmGlow: string;
  bg: string;
  card: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  isDark: boolean;
}

// ─── Light theme (original) ───
export const BRAND: BrandColors = {
  // Core brand colors
  primary: '#0EA5E9',        // Ocean blue — trust, clarity
  primaryLight: 'rgba(14, 165, 233, 0.10)',
  primaryBorder: 'rgba(14, 165, 233, 0.20)',
  success: '#10B981',        // Fresh green — growth, progress
  successLight: 'rgba(16, 185, 129, 0.10)',
  warning: '#F59E0B',        // Warm amber — attention
  warningLight: 'rgba(245, 158, 11, 0.10)',
  danger: '#EF4444',         // Clear red — alerts

  // Warm accent palette — the personality
  sunset: '#F97316',         // Sunset orange — energy, celebrations
  sunsetLight: 'rgba(249, 115, 22, 0.08)',
  golden: '#FBBF24',         // Golden — achievements, milestones
  goldenLight: 'rgba(251, 191, 36, 0.08)',
  warmTeal: '#14B8A6',       // Warm teal — positive vibes
  coral: '#FB7185',          // Coral pink — playful highlights
  warmGlow: 'rgba(249, 115, 22, 0.05)',

  // Light, warm backgrounds — like a sunny room
  bg: '#FFFBF7',             // Warm cream (hint of peach)
  card: '#FFFFFF',            // Clean white cards
  cardBorder: '#F3EDE7',     // Soft warm border (barely there)
  cardShadow: 'rgba(0,0,0,0.04)', // Gentle shadow

  // Text — warm darks, never pure black
  text: '#1C1917',           // Warm near-black (stone-900)
  textSecondary: '#78716C',  // Warm gray (stone-500)
  textMuted: '#A8A29E',      // Light muted (stone-400)

  isDark: false,
};

// ─── Dark theme ───
export const BRAND_DARK: BrandColors = {
  // Keep ALL accent colors the same
  primary: '#0EA5E9',
  primaryLight: 'rgba(14, 165, 233, 0.10)',
  primaryBorder: 'rgba(14, 165, 233, 0.20)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.10)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.10)',
  danger: '#EF4444',
  sunset: '#F97316',
  sunsetLight: 'rgba(249, 115, 22, 0.08)',
  golden: '#FBBF24',
  goldenLight: 'rgba(251, 191, 36, 0.08)',
  warmTeal: '#14B8A6',
  coral: '#FB7185',
  warmGlow: 'rgba(249, 115, 22, 0.05)',

  // Dark backgrounds
  bg: '#0C0A09',             // Warm near-black (stone-950)
  card: '#1C1917',           // stone-900
  cardBorder: '#292524',     // stone-800
  cardShadow: 'rgba(0,0,0,0.3)',

  // Text — light on dark
  text: '#FAFAF9',           // stone-50
  textSecondary: '#A8A29E',  // stone-400
  textMuted: '#78716C',      // stone-500

  isDark: true,
};

// ─── Theme Context ───
interface ThemeContextValue {
  theme: BrandColors;
  preference: ThemePreference;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: BRAND,
  preference: 'system',
});

// ─── ThemeProvider ───
interface ThemeProviderProps {
  preference: ThemePreference;
  children: React.ReactNode;
}

export function ThemeProvider({ preference, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const theme = useMemo(() => {
    if (preference === 'dark') return BRAND_DARK;
    if (preference === 'light') return BRAND;
    // system
    return systemScheme === 'dark' ? BRAND_DARK : BRAND;
  }, [preference, systemScheme]);

  const value = useMemo(() => ({ theme, preference }), [theme, preference]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

// ─── useTheme hook ───
export function useTheme(): BrandColors {
  return useContext(ThemeContext).theme;
}
