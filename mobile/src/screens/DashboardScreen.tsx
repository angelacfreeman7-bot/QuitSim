import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSimStore } from '../stores/useSimStore';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { AssumptionsCard } from '../components/AssumptionsCard';
import { RunwayChart } from '../components/RunwayChart';
import { QuickWinsCard } from '../components/QuickWinsCard';
import { BenchmarkCard } from '../components/BenchmarkCard';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { ShareCard } from '../components/ShareCard';
import { InfoTip } from '../components/InfoTip';
import { MilestoneToast } from '../components/MilestoneToast';
import { ConfidenceRing } from '../components/ConfidenceRing';
import { WeeklyProgressBanner } from '../components/WeeklyProgressBanner';
import { shareAsImage } from '../lib/shareImage';
import { showRealityCheck } from '../lib/realityCheck';
import { BRAND } from '../lib/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { shouldShowPaywallAfterSim, shouldShowPaywallAfterMilestone } from '../lib/paywallTiming';

const GREETINGS_HIGH = [
  "The beach is calling your name",
  "Your freedom chapter is almost here",
  "Imagine waking up with nowhere to be",
  "You're so close to living on your terms",
  "That dream life? It's within reach",
];

const GREETINGS_MID = [
  "You're building something beautiful",
  "Every sunrise brings you closer",
  "The view from here keeps getting better",
  "Your future is looking brighter every day",
  "Keep going — the horizon is opening up",
];

const GREETINGS_EARLY = [
  "Welcome to the first day of your new plan",
  "Let's dream big and plan smart",
  "Every adventure starts with one step",
  "You're already ahead of most people",
  "Let's turn 'what if' into 'when'",
];

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMotivation(confidence: number): string {
  const pool = confidence >= 60 ? GREETINGS_HIGH : confidence >= 30 ? GREETINGS_MID : GREETINGS_EARLY;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getTimeEmoji(): string {
  const h = new Date().getHours();
  if (h < 7) return '🌙';
  if (h < 12) return '☀️';
  if (h < 17) return '🌤️';
  if (h < 20) return '🌅';
  return '🌙';
}

// Warm gradient colors based on confidence
function getHeaderGradient(confidence: number): string[] {
  if (confidence >= 70) return ['#ECFDF5', '#F0FDFA', BRAND.bg];
  if (confidence >= 40) return ['#FFF7ED', '#FFFBF7', BRAND.bg];
  return ['#FFF1F2', '#FFF8F7', BRAND.bg];
}

export function DashboardScreen({ navigation }: any) {
  const { result, simulate, profile, params, pendingMilestone, clearMilestone, disclaimerVisible, hideDisclaimerModal, simCount, streak, lastMilestone, weeklySnapshot, setParams, setProfile: storeSetProfile } = useSimStore();

  const [upgradeFeature, setUpgradeFeature] = React.useState<string | null>(null);

  const formattedFreedomDate = useMemo(() => {
    if (!result?.freedomDate) return null;
    const d = new Date(result.freedomDate);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [result?.freedomDate]);
  const realityCheckShown = useRef(false);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    if (!result) simulate();
  }, [result, simulate]);

  useEffect(() => {
    if (pendingMilestone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [pendingMilestone]);

  useEffect(() => {
    if (result && result.quitConfidence > 80 && !realityCheckShown.current) {
      realityCheckShown.current = true;
      showRealityCheck(result);
    }
  }, [result]);

  // Smart paywall: check after simulation results
  useEffect(() => {
    if (!result) return;
    const feature = shouldShowPaywallAfterSim({
      simCount,
      confidence: result.quitConfidence,
      streakDays: streak.current,
      lastMilestone,
    });
    if (feature) {
      // Slight delay so the user sees their score first
      setTimeout(() => setUpgradeFeature(feature), 2000);
    }
  }, [result, simCount]);

  // Smart paywall: check after milestone
  useEffect(() => {
    if (!pendingMilestone || !lastMilestone) return;
    const feature = shouldShowPaywallAfterMilestone(lastMilestone);
    if (feature) {
      setTimeout(() => setUpgradeFeature(feature), 3000);
    }
  }, [pendingMilestone, lastMilestone]);

  const reviewPrompted = useRef(false);
  useEffect(() => {
    if (result && result.quitConfidence >= 70 && !reviewPrompted.current) {
      reviewPrompted.current = true;
      setTimeout(async () => {
        const available = await StoreReview.isAvailableAsync();
        if (available) StoreReview.requestReview();
      }, 3000);
    }
  }, [result]);

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#FFF7ED', '#FFFBF7', BRAND.bg]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🌅</Text>
          <Text style={styles.loading}>Crunching your numbers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleTryScenario = useCallback((profileOverrides?: Partial<typeof profile>, paramOverrides?: Partial<typeof params>) => {
    // Apply overrides and navigate to the simulator so they can explore
    if (paramOverrides) setParams(paramOverrides);
    if (profileOverrides) storeSetProfile(profileOverrides);
    navigation.navigate('Simulator');
  }, [setParams, storeSetProfile, navigation]);

  const handleShare = async () => {
    const fallbackText = `My QuitSim score: ${result.quitConfidence}% quit readiness, ${result.runwayMonths} months of runway. Find your freedom date at quitsim.it.com`;
    await shareAsImage(shareCardRef, fallbackText);
  };

  const headerGradientColors = getHeaderGradient(result.quitConfidence);
  const isStrong = result.quitConfidence >= 70;
  const isMid = result.quitConfidence >= 40;

  return (
    <SafeAreaView style={styles.container}>
      <DisclaimerModal
        visible={disclaimerVisible}
        onAccept={hideDisclaimerModal}
        dismissible
        onDismiss={hideDisclaimerModal}
      />

      <UpgradePrompt
        visible={!!upgradeFeature}
        onClose={() => setUpgradeFeature(null)}
        feature={upgradeFeature ?? undefined}
      />

      <MilestoneToast
        message={pendingMilestone ?? ''}
        visible={!!pendingMilestone}
        onDismiss={clearMilestone}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ── Warm header with gradient ── */}
        <LinearGradient
          colors={headerGradientColors as any}
          style={styles.headerGradient}
        >
          {/* Settings */}
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Pressable
              style={styles.settingsButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Settings');
              }}
              accessibilityRole="button"
              accessibilityLabel="Settings"
            >
              <Ionicons name="settings-outline" size={22} color="#A8A29E" />
            </Pressable>
          </View>

          {/* Greeting */}
          <Text style={styles.greeting}>{getTimeOfDay()} {getTimeEmoji()}</Text>
          <Text style={styles.motivation}>{getMotivation(result.quitConfidence)}</Text>

          {/* ── Freedom Date — the hero moment ── */}
          <View style={[
            styles.freedomCard,
            isStrong && styles.freedomCardStrong,
            !isStrong && isMid && styles.freedomCardMid,
          ]}>
            {result.freedomDate ? (
              <>
                <Text style={styles.freedomEmojiLarge}>🌅</Text>
                <Text style={styles.freedomLabel}>Your Freedom Date</Text>
                <Text style={[
                  styles.freedomDate,
                  { color: isStrong ? BRAND.success : isMid ? BRAND.golden : BRAND.sunset },
                ]}>
                  {formattedFreedomDate}
                </Text>
                <Text style={styles.freedomSubtitle}>
                  The earliest month you could quit and be okay
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.freedomEmojiLarge}>🧭</Text>
                <Text style={styles.freedomLabel}>Freedom Date</Text>
                <Text style={[styles.freedomDate, { color: BRAND.primary }]}>
                  Let's find your path
                </Text>
                <Text style={styles.freedomSubtitle}>
                  Try adjusting your numbers in the simulator — small changes can unlock a date
                </Text>
              </>
            )}
          </View>
        </LinearGradient>

        {/* ── Confidence Ring ── */}
        <View style={styles.gaugeContainer}>
          <ConfidenceRing
            value={result.quitConfidence}
            context={
              result.quitConfidence >= 80
                ? 'Your finances look ready'
                : result.quitConfidence >= 60
                  ? 'Getting close — a few changes could get you there'
                  : result.quitConfidence >= 40
                    ? 'Making progress — keep building'
                    : result.quitConfidence >= 20
                      ? 'Early days — small steps add up fast'
                      : 'Just getting started — everyone begins here'
            }
          />
          <InfoTip text="This score is like a report card for your quit plan. It looks at three things: how many months your money would last (biggest factor), how your plan holds up when bad things happen (like a market crash or surprise bill), and how much savings cushion you have. 70%+ means you're in good shape." />
          <Pressable
            onPress={() =>
              Alert.alert(
                'What does this score mean?',
                'Think of it like a readiness grade from 0 to 100:\n\n\u2022 70%+ — Your money situation looks solid. You could likely quit and be okay.\n\u2022 40–70% — You\'re on your way. A few changes could make a big difference.\n\u2022 Under 40% — You\'re building the foundation. Everyone starts somewhere.\n\nThe score is based on how long your money lasts, how it handles surprises, and how much cushion you have saved up.'
              )
            }
            accessibilityRole="button"
            accessibilityLabel="What does this score mean?"
          >
            <Text style={styles.confidenceExplainer}>What does this score mean?</Text>
          </Pressable>
        </View>

        {/* Reality Check banner */}
        {result.quitConfidence > 80 && (
          <View style={styles.realityBanner}>
            <Text style={styles.realityIcon}>🔍</Text>
            <Text style={styles.realityText}>
              A high score is great, but this is a simplified model. Scroll down to see what it doesn&apos;t include, and talk to a financial advisor before big decisions.
            </Text>
          </View>
        )}

        {/* ── Weekly Progress ── */}
        {weeklySnapshot && (
          <WeeklyProgressBanner
            currentConfidence={result.quitConfidence}
            currentRunway={result.runwayMonths}
            previousConfidence={weeklySnapshot.confidence}
            previousRunway={weeklySnapshot.runway}
            recordedAt={weeklySnapshot.recordedAt}
          />
        )}

        {/* ── Stats Row — warm cards ── */}
        <View style={styles.statsRow} accessibilityRole="summary">
          <View style={styles.statCard} accessible accessibilityLabel={`${result.runwayMonths} months your money lasts`}>
            <AnimatedNumber value={result.runwayMonths} style={styles.statValue} />
            <View style={styles.inlineRow}>
              <Text style={styles.statLabel}>Months covered</Text>
              <InfoTip text="If you quit today, this is how many months your savings and any new income could cover your bills before running out." />
            </View>
          </View>
          <View style={styles.statCard} accessible accessibilityLabel={`${result.monteCarlo.successRate} percent of what-if scenarios passed`}>
            <AnimatedNumber value={result.monteCarlo.successRate} suffix="%" style={styles.statValue} />
            <View style={styles.inlineRow}>
              <Text style={styles.statLabel}>&ldquo;What if&rdquo; score</Text>
              <InfoTip text="We tested your plan hundreds of times with random bad luck — market drops, surprise expenses. This is how often your plan still worked. 80%+ means your plan is solid." />
            </View>
          </View>
        </View>

        {/* Your Biggest Lever + Quick Wins */}
        <QuickWinsCard profile={profile} params={params} currentResult={result} onTryScenario={handleTryScenario} />

        {/* Runway Chart */}
        <RunwayChart months={result.months} />

        {/* Benchmarks */}
        <BenchmarkCard
          salary={profile.salary}
          savings={profile.savings}
          monthlyExpenses={profile.monthlyExpenses}
          runwayMonths={result.runwayMonths}
        />

        {/* Assumptions */}
        <AssumptionsCard />

        {/* ── CTAs — warm and inviting ── */}
        <LinearGradient
          colors={['rgba(14,165,233,0.08)', 'rgba(14,165,233,0.02)']}
          style={styles.ctaGradient}
        >
          <Pressable
            style={styles.primaryButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Simulator'); }}
            accessibilityRole="button"
            accessibilityLabel="Explore what-if scenarios"
          >
            <Ionicons name="trending-up" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Explore &ldquo;What If&rdquo; Scenarios</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.outlineButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Practice'); }}
            accessibilityRole="button"
            accessibilityLabel="Daily actions"
          >
            <Ionicons name="flash-outline" size={16} color={BRAND.golden} style={{ marginRight: 6 }} />
            <Text style={styles.outlineButtonText}>Daily Actions</Text>
          </Pressable>
          <Pressable
            style={styles.outlineButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleShare(); }}
            accessibilityRole="button"
            accessibilityLabel="Share your results"
          >
            <Ionicons name="share-outline" size={16} color={BRAND.primary} style={{ marginRight: 6 }} />
            <Text style={styles.outlineButtonText}>Share</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Pressable onPress={() => useSimStore.getState().showDisclaimerModal()}>
          <Text style={styles.disclaimerLink}>Read Full Disclaimer</Text>
        </Pressable>

        <Text style={styles.privacy}>
          All calculations run on-device. Your data stays yours.
        </Text>
      </ScrollView>

      {/* Off-screen ShareCard */}
      <View style={styles.offScreen} pointerEvents="none">
        <ShareCard
          ref={shareCardRef}
          quitConfidence={result.quitConfidence}
          runwayMonths={result.runwayMonths}
          stressTestPct={result.monteCarlo.successRate}
          freedomDate={result.freedomDate}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.bg },
  scroll: { paddingBottom: 32 },

  // Header
  headerGradient: { width: '100%', paddingTop: 4, paddingBottom: 8, paddingHorizontal: 24, alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginBottom: 4 } as any,
  headerSpacer: { flex: 1 },
  settingsButton: { padding: 8 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { fontSize: 48, marginBottom: 12 },
  loading: { color: BRAND.textSecondary, fontSize: 16, textAlign: 'center' },

  // Greeting
  greeting: { color: BRAND.textSecondary, fontSize: 15, marginBottom: 4 },
  motivation: {
    color: BRAND.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 30,
  },

  // Freedom Card — the hero
  freedomCard: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 8,
    alignItems: 'center',
  },
  freedomCardStrong: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  freedomCardMid: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  freedomEmojiLarge: { fontSize: 36, marginBottom: 8 },
  freedomLabel: { color: BRAND.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  freedomDate: { fontSize: 28, fontWeight: '800', marginBottom: 6 },
  freedomSubtitle: { color: BRAND.textSecondary, fontSize: 13, textAlign: 'center' },

  // Confidence
  gaugeContainer: { alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 },
  confidenceExplainer: { color: BRAND.primary, fontSize: 12, textDecorationLine: 'underline', marginTop: 8 },

  // Reality banner
  realityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  realityIcon: { fontSize: 16 },
  realityText: { color: '#78350F', fontSize: 12, lineHeight: 18, flex: 1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16, paddingHorizontal: 24, width: '100%' },
  statCard: {
    flex: 1,
    backgroundColor: BRAND.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  statValue: { color: BRAND.text, fontSize: 30, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { color: BRAND.textMuted, fontSize: 11, marginTop: 4 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  // CTAs
  ctaGradient: {
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButton: {
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    height: 54,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginBottom: 16 },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  outlineButtonText: { color: BRAND.text, fontSize: 14, fontWeight: '500' },

  // Footer
  disclaimerLink: {
    color: BRAND.textMuted,
    fontSize: 12,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginBottom: 8,
  },
  privacy: { color: BRAND.textSecondary, fontSize: 11, textAlign: 'center' },
  offScreen: { position: 'absolute', left: -9999, top: 0 },
});
