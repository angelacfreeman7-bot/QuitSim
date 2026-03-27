import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Share,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useSimStore } from '../stores/useSimStore';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { PRESETS } from '../lib/engine';
import { canSavePlan, FREE_PLAN_LIMIT } from '../lib/premium';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { AssumptionsCard } from '../components/AssumptionsCard';
import { RunwayChart } from '../components/RunwayChart';
import { DisclaimerModal } from '../components/DisclaimerModal';
import { ShareCard } from '../components/ShareCard';
import { InfoTip } from '../components/InfoTip';
import { shareAsImage } from '../lib/shareImage';
import { showRealityCheck } from '../lib/realityCheck';
import { FUN_PRESETS, getEasterEggText } from '../lib/funPresets';
import { useTheme } from '../lib/theme';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v);

export function SimulatorScreen() {
  const BRAND = useTheme();
  const {
    params, setParams, applyPreset, result, simulate, savePlan, plans, disclaimerAccepted,
    funMode, funModeUnlocked, activeFunPreset, toggleFunMode, applyFunPreset,
    canUndo, undoParams, resetParams,
  } = useSimStore();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [planName, setPlanName] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const realityCheckShown = useRef(false);
  const confettiRef = useRef<any>(null);
  const shareCardRef = useRef<View>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Fire confetti when a confetti-enabled fun preset is applied
  useEffect(() => {
    if (activeFunPreset?.confetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [activeFunPreset?.id]);

  // Show Reality Check alert when confidence > 80%
  useEffect(() => {
    if (result && result.quitConfidence > 80 && !realityCheckShown.current) {
      realityCheckShown.current = true;
      showRealityCheck(result);
    }
  }, [result?.quitConfidence]);

  if (!result) {
    simulate();
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BRAND.bg }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🎲</Text>
          <Text style={[styles.loadingText, { color: BRAND.textSecondary }]}>Running simulations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Must accept disclaimer before saving any plan
    if (!disclaimerAccepted) {
      Alert.alert(
        'Disclaimer Required',
        'You must accept the legal disclaimer before saving plans.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (!canSavePlan(plans.length)) {
      setShowUpgrade(true);
      return;
    }
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    if (planName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      savePlan(planName.trim());
      setPlanName('');
      setShowSaveDialog(false);
    }
  };

  const handleShare = async () => {
    const fallbackText = `QuitSim: ${result.quitConfidence}% quit readiness, my money lasts ${result.runwayMonths} months, ${result.monteCarlo.successRate}% stress test pass rate. Try it at quitsim.it.com`;
    await shareAsImage(shareCardRef, fallbackText);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.bg }, activeFunPreset && { backgroundColor: activeFunPreset.screenBg }]}>
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={120}
          origin={{ x: -10, y: 0 }}
          fadeOut
          colors={['#fbbf24', '#f59e0b', '#34d399', '#818cf8', '#f472b6']}
        />
      )}
      <UpgradePrompt
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Save unlimited quit plans"
      />
      <DisclaimerModal
        visible={showDisclaimer}
        onAccept={() => setShowDisclaimer(false)}
        dismissible
        onDismiss={() => setShowDisclaimer(false)}
      />

      {/* Save dialog */}
      <Modal
        visible={showSaveDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: BRAND.card }]}>
            <Text style={[styles.dialogTitle, { color: BRAND.text }]}>Save this plan</Text>
            <TextInput
              style={[styles.dialogInput, { backgroundColor: BRAND.bg, borderColor: BRAND.cardBorder, color: BRAND.text }]}
              placeholder="My quit plan"
              placeholderTextColor={BRAND.textMuted}
              value={planName}
              onChangeText={setPlanName}
              autoFocus
            />
            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogCancel, { borderColor: BRAND.cardBorder }]}
                onPress={() => setShowSaveDialog(false)}
              >
                <Text style={[styles.dialogCancelText, { color: BRAND.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.dialogSave, { backgroundColor: BRAND.primary }]} onPress={confirmSave}>
                <Text style={styles.dialogSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: BRAND.text }]}>
            {funMode ? '✨ Dream Mode' : 'Simulate Your Quit'}
          </Text>
          {funModeUnlocked && (
            <Pressable
              style={[styles.funToggle, { borderColor: BRAND.cardBorder }, funMode && styles.funToggleActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFunMode(); }}
            >
              <Text style={[styles.funToggleText, { color: BRAND.text }]}>
                {funMode ? '🎪 ON' : '🎪 Fun'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Undo / Reset toolbar */}
        <View style={styles.undoResetRow}>
          {canUndo ? (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); undoParams(); }}
            >
              <Text style={[styles.undoTextActive, { color: BRAND.primary }]}>Undo</Text>
            </Pressable>
          ) : (
            <Text style={[styles.undoTextDisabled, { color: BRAND.textMuted }]}>Undo</Text>
          )}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Reset all settings?', 'This will restore default parameters.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: resetParams },
              ]);
            }}
          >
            <Text style={[styles.resetText, { color: BRAND.textSecondary }]}>Reset</Text>
          </Pressable>
        </View>

        {/* Fun Mode fantasy disclaimer */}
        {funMode && (
          <View style={styles.fantasyBanner}>
            <Text style={styles.fantasyText}>
              🦄 FANTASY MODE — These are dream scenarios for fun. Not financial advice. Not even close.
            </Text>
          </View>
        )}

        {/* Fun Mode preset chips */}
        {funMode && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.presetRow}
          >
            {FUN_PRESETS.map((preset) => (
              <Pressable
                key={preset.id}
                style={[
                  styles.funChip,
                  { backgroundColor: activeFunPreset?.id === preset.id ? preset.bgColor : BRAND.card,
                    borderColor: activeFunPreset?.id === preset.id ? preset.color : BRAND.cardBorder } as any,
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); applyFunPreset(preset); }}
              >
                <Text style={styles.funChipEmoji}>{preset.emoji}</Text>
                <View>
                  <Text style={[styles.funChipName, { color: activeFunPreset?.id === preset.id ? preset.color : BRAND.text } as any]}>
                    {preset.name}
                  </Text>
                  <Text style={[styles.funChipTagline, { color: BRAND.textSecondary }]}>{preset.tagline}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Regular Presets (hidden in fun mode) */}
        {!funMode && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.presetRow}
          >
            {PRESETS.map((preset) => (
              <Pressable
                key={preset.id}
                style={[styles.presetButton, { borderColor: BRAND.cardBorder }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); applyPreset(preset.params); }}
              >
                <Text style={[styles.presetText, { color: BRAND.text }]}>{preset.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Sliders */}
        <View style={[styles.sliderCard, { backgroundColor: BRAND.card }, activeFunPreset && { backgroundColor: activeFunPreset.bgColor, borderWidth: 1, borderColor: activeFunPreset.color + '30' }]}>
          <SliderRow
            label="How Much Pay You Give Up"
            value={params.incomeDropPct}
            min={0}
            max={100}
            step={5}
            suffix="%"
            onValueChange={(v) => setParams({ incomeDropPct: v })}
            infoText="If you quit completely, this is 100%. Going part-time? Maybe 50%. Taking a pay cut for a less stressful job? Maybe 30%. Slide to see what happens."
          />
          <SliderRow
            label="Money Coming In After Quitting"
            value={params.newMonthlyIncome}
            min={0}
            max={20000}
            step={250}
            format={formatCurrency}
            onValueChange={(v) => setParams({ newMonthlyIncome: v })}
            infoText="Will you earn anything after quitting? Freelance gigs, a part-time job, selling things online, rental income — add it up here. $0 is fine if you're not sure."
          />
          <SliderRow
            label="New Costs After Quitting"
            value={params.additionalExpenses}
            min={0}
            max={10000}
            step={100}
            format={formatCurrency}
            onValueChange={(v) => setParams({ additionalExpenses: v })}
            infoText="Will quitting add new costs? The biggest one is usually health insurance ($500-$1,000+/mo without an employer). You might also have new commute costs or childcare."
          />
          <SliderRow
            label="How Fast Your Savings Grow"
            value={params.investmentReturn}
            min={-10}
            max={20}
            step={0.5}
            suffix="%"
            onValueChange={(v) => setParams({ investmentReturn: v })}
            infoText="If your money is in a regular savings account, this is around 4-5%. If it's in stocks (like a 401k), the long-term average is about 7%. Not sure? 7% is a reasonable guess."
          />
          <SliderRow
            label="Will Your Area Get Cheaper or Pricier?"
            value={params.colChange}
            min={-50}
            max={50}
            step={5}
            suffix="%"
            onValueChange={(v) => setParams({ colChange: v })}
            infoText="Planning to move somewhere cheaper? Slide left (e.g., -20%). Staying put? Leave it at 0%. Moving somewhere more expensive? Slide right."
          />
        </View>

        <Text style={[styles.hintText, { color: BRAND.textMuted }]}>Explore freely — undo any change or reset anytime</Text>

        {/* Black Swan Toggle */}
        <View style={[styles.blackSwanCard, { backgroundColor: BRAND.card }]}>
          <View style={styles.blackSwanTextCol}>
            <View style={styles.inlineRow}>
              <Text style={[styles.blackSwanLabel, { color: BRAND.text }]}>Include surprise expenses</Text>
              <InfoTip text="Life throws curveballs — a car breakdown, a medical bill, a broken appliance. This adds random surprise costs to see if your plan still works when things go wrong. We recommend keeping this on." />
            </View>
            <Text style={[styles.blackSwanSubtitle, { color: BRAND.textSecondary }]}>What happens if your car breaks down or you get a surprise bill?</Text>
          </View>
          <Switch
            value={!!params.blackSwan}
            onValueChange={() => setParams({ blackSwan: !params.blackSwan })}
            trackColor={{ false: BRAND.cardBorder, true: '#f87171' }}
            thumbColor="#fff"
            accessibilityLabel="Include unexpected expenses"
            accessibilityRole="switch"
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }, activeFunPreset && { backgroundColor: activeFunPreset.bgColor }]}>
            <AnimatedNumber value={result.quitConfidence} suffix="%" style={[styles.statValue, { color: BRAND.text }, activeFunPreset ? { color: activeFunPreset.color } : undefined]} />
            <View style={styles.inlineRow}>
              <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>Readiness</Text>
              <InfoTip text="Your overall score out of 100. It looks at how long your money lasts, how your plan holds up when bad stuff happens, and how much of a savings cushion you have. 70%+ means you\u2019re in good shape." />
            </View>
          </View>
          <View style={[styles.stat, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }, activeFunPreset && { backgroundColor: activeFunPreset.bgColor }]}>
            <AnimatedNumber value={result.runwayMonths} style={[styles.statValue, { color: BRAND.text }, activeFunPreset ? { color: activeFunPreset.color } : undefined]} />
            <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>Months</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }, activeFunPreset && { backgroundColor: activeFunPreset.bgColor }]}>
            <AnimatedNumber value={result.monteCarlo.successRate} suffix="%" style={[styles.statValue, { color: BRAND.text }, activeFunPreset ? { color: activeFunPreset.color } : undefined]} />
            <View style={styles.inlineRow}>
              <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>&ldquo;What if&rdquo;</Text>
              <InfoTip text="We tested your plan hundreds of times with random bad luck added in. This is how often your money still lasted. 80%+ means your plan is solid even when things go wrong." />
            </View>
          </View>
          <View style={[styles.stat, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }, activeFunPreset && { backgroundColor: activeFunPreset.bgColor }]}>
            <Text style={[styles.statValue, { color: BRAND.text }, activeFunPreset && { color: activeFunPreset.color }]}>
              {result.freedomDate
                ? (() => {
                    const d = new Date(result.freedomDate);
                    return `${d.toLocaleDateString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
                  })()
                : '\u2014'}
            </Text>
            <View style={styles.inlineRow}>
              <Text style={[styles.statLabel, { color: BRAND.textSecondary }]}>Target Date</Text>
              <InfoTip text="The earliest month we think you could quit and be financially okay, based on these settings." />
            </View>
          </View>
        </View>

        {/* Runway Chart */}
        <RunwayChart months={result.months} />

        {/* Fun Mode narrative */}
        {funMode && activeFunPreset && (
          <View style={[styles.funNarrative, { backgroundColor: activeFunPreset.bgColor, borderColor: activeFunPreset.color }]}>
            <Text style={[styles.funNarrativePrefix, { color: BRAND.text }]}>{activeFunPreset.narrative.prefix}</Text>
            <Text style={[styles.funNarrativeSummary, { color: BRAND.textSecondary }]}>{activeFunPreset.narrative.summary}</Text>
            <Text style={[styles.funNarrativeJoke, { color: BRAND.textSecondary }]}>{activeFunPreset.narrative.joke}</Text>
            {result && getEasterEggText(result.quitConfidence, activeFunPreset.id) && (
              <Text style={[styles.funEasterEgg, { color: activeFunPreset.color }]}>
                {getEasterEggText(result.quitConfidence, activeFunPreset.id)}
              </Text>
            )}
          </View>
        )}

        {/* Reality Check banner for high confidence */}
        {result.quitConfidence > 80 && (
          <View style={styles.realityBanner}>
            <Text style={styles.realityIcon}>🔍</Text>
            <Text style={[styles.realityText, { color: BRAND.warning }]}>
              Great progress! For the most accurate picture, review the assumptions below and chat with a financial advisor.
            </Text>
          </View>
        )}

        {/* MC detail */}
        <View style={styles.mcDetail}>
          <Text style={[styles.mcText, { color: BRAND.textMuted }]}>
            If things go badly: {result.monteCarlo.p10}mo · Typical:{' '}
            {result.monteCarlo.median}mo · If things go well: {result.monteCarlo.p90}mo
          </Text>
        </View>

        {/* Assumptions warnings */}
        <View style={{ marginBottom: 16 }}>
          <AssumptionsCard />
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <Pressable style={styles.saveButton} onPress={handleSave} accessibilityRole="button" accessibilityLabel={`Save plan. ${plans.length} of ${FREE_PLAN_LIMIT} used`}>
            <Text style={styles.saveButtonText}>
              💾 Save Plan ({plans.length}/{FREE_PLAN_LIMIT})
            </Text>
          </Pressable>
          <Pressable style={styles.shareButton} onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share results">
            <Text style={styles.shareButtonText}>📤 Share</Text>
          </Pressable>
        </View>

        {/* Disclaimer link */}
        <Pressable
          style={styles.disclaimerLink}
          onPress={() => setShowDisclaimer(true)}
        >
          <Text style={[styles.disclaimerLinkText, { color: BRAND.textSecondary }]}>Read Full Disclaimer</Text>
        </Pressable>
      </ScrollView>

      {/* Off-screen ShareCard for image capture */}
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

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  format,
  onValueChange,
  infoText,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  format?: (v: number) => string;
  onValueChange: (v: number) => void;
  infoText?: string;
}) {
  const BRAND = useTheme();
  const display = format ? format(value) : `${value}${suffix || ''}`;
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <View style={styles.inlineRow}>
          <Text style={[styles.sliderLabel, { color: BRAND.textSecondary }]}>{label}</Text>
          {infoText && <InfoTip text={infoText} />}
        </View>
        <Text style={[styles.sliderValue, { color: BRAND.text }]}>{display}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onSlidingComplete={onValueChange}
        minimumTrackTintColor={BRAND.primary}
        maximumTrackTintColor={BRAND.cardBorder}
        thumbTintColor={BRAND.primary}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: display }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { fontSize: 40, marginBottom: 12 },
  loadingText: { fontSize: 16 },
  scroll: { padding: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  undoResetRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 8 },
  undoTextActive: { fontSize: 13 },
  undoTextDisabled: { fontSize: 13 },
  resetText: { fontSize: 13 },
  hintText: { fontSize: 11, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  funToggle: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  funToggleActive: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  funToggleText: { fontSize: 13, fontWeight: '600' },
  fantasyBanner: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  fantasyText: { color: '#a855f7', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  funChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    gap: 8,
  },
  funChipEmoji: { fontSize: 22 },
  funChipName: { fontSize: 13, fontWeight: '600' },
  funChipTagline: { fontSize: 10, marginTop: 1 },
  funNarrative: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  funNarrativePrefix: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  funNarrativeSummary: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  funNarrativeJoke: { fontSize: 12, fontStyle: 'italic' },
  funEasterEgg: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  presetRow: { marginBottom: 16 },
  presetButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  presetText: { fontSize: 13 },
  sliderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sliderRow: { marginBottom: 16 },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  sliderLabel: { fontSize: 13, flexShrink: 1 },
  sliderValue: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  slider: { width: '100%', height: 36 },
  blackSwanCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blackSwanTextCol: { flex: 1, marginRight: 12 },
  blackSwanLabel: { fontSize: 14, fontWeight: '600' },
  blackSwanSubtitle: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  stat: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontSize: 10, marginTop: 2 },

  // MC detail
  mcDetail: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  mcText: { fontSize: 11, fontVariant: ['tabular-nums'] },

  // Actions
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  saveButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: { color: '#059669', fontSize: 13, fontWeight: '600' },
  shareButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
    backgroundColor: 'rgba(14, 165, 233, 0.06)',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  shareButtonText: { color: '#0EA5E9', fontSize: 13, fontWeight: '600' },

  // Save dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  dialogInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  dialogActions: { flexDirection: 'row', gap: 12 },
  dialogCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogCancelText: { fontSize: 14 },
  dialogSave: {
    flex: 1,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogSaveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  // Reality check banner
  realityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 8,
  },
  realityIcon: { fontSize: 16 },
  realityText: { fontSize: 12, lineHeight: 17, flex: 1 },

  // Disclaimer link
  disclaimerLink: { alignItems: 'center', marginBottom: 20 },
  disclaimerLinkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  offScreen: { position: 'absolute', left: -9999, top: 0 },
});
