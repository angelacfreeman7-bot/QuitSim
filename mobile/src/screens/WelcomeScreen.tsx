import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BRAND } from '../lib/theme';
import { runSimulation, DEFAULT_PARAMS } from '../lib/engine';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─────────────────────────────────────────────
   Slide 1: HOOK — Big, bright, exciting
   ───────────────────────────────────────────── */
function SlideHook() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeIn1 = useRef(new Animated.Value(0)).current;
  const fadeIn2 = useRef(new Animated.Value(0)).current;
  const fadeIn3 = useRef(new Animated.Value(0)).current;
  const fadeIn4 = useRef(new Animated.Value(0)).current;
  const slideUp1 = useRef(new Animated.Value(24)).current;
  const slideUp2 = useRef(new Animated.Value(24)).current;
  const slideUp3 = useRef(new Animated.Value(24)).current;
  const slideUp4 = useRef(new Animated.Value(24)).current;
  const demoScore = useRef(new Animated.Value(0)).current;
  const demoBarWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeIn1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideUp1, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeIn2, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideUp2, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeIn3, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideUp3, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeIn4, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideUp4, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ]),
    ).start();

    // Animate demo score filling up
    Animated.timing(demoScore, { toValue: 73, duration: 2000, delay: 800, useNativeDriver: false, easing: Easing.out(Easing.cubic) }).start();
    Animated.timing(demoBarWidth, { toValue: 1, duration: 2000, delay: 800, useNativeDriver: false, easing: Easing.out(Easing.cubic) }).start();
  }, [pulseAnim, fadeIn1, fadeIn2, fadeIn3, fadeIn4, slideUp1, slideUp2, slideUp3, slideUp4, demoScore, demoBarWidth]);

  return (
    <View style={s.hookContainer}>
      <Animated.Text style={[s.bigEmoji, { transform: [{ scale: pulseAnim }] }]}>
        🏖️
      </Animated.Text>

      <Animated.View style={{ opacity: fadeIn1, transform: [{ translateY: slideUp1 }] }}>
        <Text style={s.hookTitle}>
          When could you{'\n'}
          <Text style={s.hookTitleAccent}>quit your job?</Text>
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeIn2, transform: [{ translateY: slideUp2 }] }}>
        <Text style={s.hookSub}>Find out in 60 seconds.</Text>
      </Animated.View>

      {/* Mini demo preview — shows what the app delivers */}
      <Animated.View style={[s.demoCard, { opacity: fadeIn3, transform: [{ translateY: slideUp3 }] }]}>
        <View style={s.demoRow}>
          <View style={s.demoScoreBox}>
            <Animated.Text style={[s.demoScoreText, { color: BRAND.success }]}>
              {demoScore.interpolate({ inputRange: [0, 73], outputRange: ['0', '73'] })}
            </Animated.Text>
            <Text style={s.demoScoreUnit}>%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.demoLabel}>Quit Readiness</Text>
            <View style={s.demoBarTrack}>
              <Animated.View style={[s.demoBarFill, { width: demoBarWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '73%'] }), backgroundColor: BRAND.success }]} />
            </View>
            <Text style={s.demoHint}>Freedom Date: March 2027</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[s.tagRow, { opacity: fadeIn4, transform: [{ translateY: slideUp4 }] }]}>
        <View style={s.tagGreen}>
          <Text style={s.tagGreenText}>100% free</Text>
        </View>
        <View style={s.tagBlue}>
          <Text style={s.tagBlueText}>100% private</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeIn4, transform: [{ translateY: slideUp4 }] }}>
        <Text style={s.hookDetail}>
          No sign-up. No servers.{'\n'}Your numbers never leave this phone.
        </Text>
      </Animated.View>
    </View>
  );
}

/* ─────────────────────────────────────────────
   Slide 2: YOUR NUMBERS — playful sliders
   ───────────────────────────────────────────── */
interface NumbersData {
  salary: number;
  savings: number;
  expenses: number;
}

function formatK(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}
function formatDollar(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

function getSliderReaction(data: NumbersData): { emoji: string; text: string; color: string } {
  const ratio = (data.savings + (data.salary / 12) * 3) / Math.max(data.expenses, 1);
  if (ratio > 20) return { emoji: '🤑', text: "You're sitting pretty!", color: BRAND.success };
  if (ratio > 10) return { emoji: '😎', text: 'Looking good!', color: BRAND.success };
  if (ratio > 5) return { emoji: '💪', text: 'Solid foundation!', color: BRAND.warmTeal };
  if (ratio > 3) return { emoji: '🌱', text: "Great start — let's see!", color: BRAND.sunset };
  return { emoji: '🚀', text: 'Everyone starts somewhere!', color: BRAND.coral };
}

function SlideNumbers({ data, onChange }: { data: NumbersData; onChange: (d: NumbersData) => void }) {
  const reaction = getSliderReaction(data);

  return (
    <View style={s.center}>
      <View style={[s.reactionBubble, { backgroundColor: reaction.color + '12', borderColor: reaction.color + '30' }]}>
        <Text style={s.reactionEmoji}>{reaction.emoji}</Text>
        <Text style={[s.reactionText, { color: reaction.color }]}>{reaction.text}</Text>
      </View>

      <Text style={s.sectionTitle}>Drag the sliders</Text>
      <Text style={s.sectionSub}>Rough numbers are perfect. You can fine-tune later.</Text>

      <View style={s.sliderCard}>
        <View style={s.sliderGroup}>
          <View style={s.sliderHeader}>
            <Text style={s.sliderLabel}>💰 Yearly pay</Text>
            <Text style={[s.sliderValue, { color: BRAND.primary }]}>{formatK(data.salary)}</Text>
          </View>
          <Slider
            style={s.slider}
            minimumValue={20000}
            maximumValue={300000}
            step={5000}
            value={data.salary}
            onValueChange={(v) => onChange({ ...data, salary: v })}
            minimumTrackTintColor={BRAND.primary}
            maximumTrackTintColor="#E7E5E4"
            thumbTintColor={BRAND.primary}
          />
          <View style={s.sliderRange}>
            <Text style={s.rangeText}>$20k</Text>
            <Text style={s.rangeText}>$300k</Text>
          </View>
        </View>

        <View style={s.sliderDivider} />

        <View style={s.sliderGroup}>
          <View style={s.sliderHeader}>
            <Text style={s.sliderLabel}>🏦 Total savings</Text>
            <Text style={[s.sliderValue, { color: BRAND.success }]}>{formatK(data.savings)}</Text>
          </View>
          <Slider
            style={s.slider}
            minimumValue={0}
            maximumValue={500000}
            step={5000}
            value={data.savings}
            onValueChange={(v) => onChange({ ...data, savings: v })}
            minimumTrackTintColor={BRAND.success}
            maximumTrackTintColor="#E7E5E4"
            thumbTintColor={BRAND.success}
          />
          <View style={s.sliderRange}>
            <Text style={s.rangeText}>$0</Text>
            <Text style={s.rangeText}>$500k</Text>
          </View>
        </View>

        <View style={s.sliderDivider} />

        <View style={s.sliderGroup}>
          <View style={s.sliderHeader}>
            <Text style={s.sliderLabel}>🔥 Monthly spend</Text>
            <Text style={[s.sliderValue, { color: BRAND.sunset }]}>{formatDollar(data.expenses)}</Text>
          </View>
          <Slider
            style={s.slider}
            minimumValue={1000}
            maximumValue={15000}
            step={250}
            value={data.expenses}
            onValueChange={(v) => onChange({ ...data, expenses: v })}
            minimumTrackTintColor={BRAND.sunset}
            maximumTrackTintColor="#E7E5E4"
            thumbTintColor={BRAND.sunset}
          />
          <View style={s.sliderRange}>
            <Text style={s.rangeText}>$1k</Text>
            <Text style={s.rangeText}>$15k</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────
   Slide 3: YOUR RESULTS — the "wow" moment
   ───────────────────────────────────────────── */
interface PreviewResult {
  confidence: number;
  freedomDate: string | null;
  runwayMonths: number;
  stressTest: number;
}

function SlideResults({ result, loading }: { result: PreviewResult | null; loading: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const detailsFade = useRef(new Animated.Value(0)).current;
  const detailsSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (result && !loading) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(detailsFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(detailsSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [result, loading, fadeAnim, scaleAnim, detailsFade, detailsSlide]);

  if (loading || !result) {
    return (
      <View style={s.loadingCenter}>
        <Text style={{ fontSize: 56 }}>🔮</Text>
        <ActivityIndicator size="large" color={BRAND.sunset} style={{ marginTop: 16 }} />
        <Text style={s.loadingText}>Stress-testing your finances...</Text>
        <Text style={s.loadingSubText}>Simulating 500 different futures</Text>
      </View>
    );
  }

  const color = result.confidence >= 70 ? BRAND.success : result.confidence >= 40 ? BRAND.sunset : BRAND.coral;
  const freedomFormatted = result.freedomDate
    ? new Date(result.freedomDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const message = result.confidence >= 70
    ? "You're closer than you think!"
    : result.confidence >= 40
      ? "You're on your way!"
      : "Everyone starts somewhere!";

  const subMessage = result.confidence >= 70
    ? "Your numbers are looking strong. Let's fine-tune your plan."
    : result.confidence >= 40
      ? "A few smart moves could change everything."
      : "The best plans start with knowing where you stand.";

  return (
    <View style={s.center}>
      <Animated.View style={[s.scoreCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={s.resultsLabel}>YOUR QUIT READINESS</Text>
        <Text style={[s.bigScore, { color }]}>{result.confidence}%</Text>
        <Text style={[s.scoreMessage, { color }]}>{message}</Text>
        <Text style={s.scoreSub}>{subMessage}</Text>
      </Animated.View>

      <Animated.View style={[{ width: '100%' }, { opacity: detailsFade, transform: [{ translateY: detailsSlide }] }]}>
        {freedomFormatted && (
          <View style={s.freedomCard}>
            <Text style={{ fontSize: 28 }}>🌅</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.freedomLabel}>Your Freedom Date</Text>
              <Text style={s.freedomDate}>{freedomFormatted}</Text>
            </View>
          </View>
        )}

        <View style={s.miniStatsRow}>
          <View style={s.miniStat}>
            <Text style={s.miniStatValue}>{result.runwayMonths}</Text>
            <Text style={s.miniStatLabel}>months covered</Text>
          </View>
          <View style={s.miniStatDivider} />
          <View style={s.miniStat}>
            <Text style={s.miniStatValue}>{result.stressTest}%</Text>
            <Text style={s.miniStatLabel}>stress test pass</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/* ─────────────────────────────────────────────
   Slide 4: LET'S GO
   ───────────────────────────────────────────── */
function SlideLetsGo({ disclaimerAccepted, setDisclaimerAccepted }: {
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (v: boolean) => void;
}) {
  return (
    <View style={s.center}>
      <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 16 }}>🚀</Text>
      <Text style={s.letsGoTitle}>
        Ready to build{'\n'}
        <Text style={{ color: BRAND.primary }}>your plan?</Text>
      </Text>
      <Text style={s.letsGoSub}>
        We'll save your numbers and unlock the full{'\n'}
        simulator, daily challenges, and what-if explorer.
      </Text>

      <View style={s.trustRow}>
        {[
          { icon: 'lock-closed' as const, text: 'Stays on your phone', color: BRAND.primary },
          { icon: 'calculator' as const, text: 'All math runs locally', color: BRAND.success },
          { icon: 'trash' as const, text: 'Delete app = data gone', color: BRAND.sunset },
        ].map((item, i) => (
          <View key={i} style={s.trustPill}>
            <Ionicons name={item.icon} size={14} color={item.color} />
            <Text style={s.trustPillText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={s.disclaimerRow}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setDisclaimerAccepted(!disclaimerAccepted);
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: disclaimerAccepted }}
      >
        <View style={[s.checkbox, disclaimerAccepted && s.checkboxChecked]}>
          {disclaimerAccepted && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text style={s.disclaimerText}>
          I understand this is an educational tool, not financial advice.
        </Text>
      </Pressable>
    </View>
  );
}

/* ─────────────────────────────────────────────
   Main WelcomeScreen
   ───────────────────────────────────────────── */
const TOTAL_SLIDES = 4;

interface WelcomeScreenProps {
  onComplete: (numbers?: NumbersData) => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [slide, setSlide] = useState(0);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [numbers, setNumbers] = useState<NumbersData>({ salary: 75000, savings: 30000, expenses: 3500 });
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [computing, setComputing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback(
    (callback: () => void) => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH * 0.2, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        callback();
        slideAnim.setValue(SCREEN_WIDTH * 0.2);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim],
  );

  const runPreview = useCallback(() => {
    setComputing(true);
    setPreviewResult(null);
    setTimeout(() => {
      try {
        const profile = {
          id: 'preview', zip: '', city: '', state: '',
          salary: numbers.salary, savings: numbers.savings, investments: 0,
          monthlyExpenses: numbers.expenses, debt: 0, createdAt: new Date().toISOString(),
        };
        const result = runSimulation(profile, DEFAULT_PARAMS, 100);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPreviewResult({
          confidence: result.quitConfidence,
          freedomDate: result.freedomDate,
          runwayMonths: result.runwayMonths,
          stressTest: result.monteCarlo.successRate,
        });
      } catch {
        setPreviewResult({ confidence: 0, freedomDate: null, runwayMonths: 0, stressTest: 0 });
      }
      setComputing(false);
    }, 1000);
  }, [numbers]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (slide === 1) {
      animateTransition(() => { setSlide(2); runPreview(); });
    } else if (slide < TOTAL_SLIDES - 1) {
      animateTransition(() => setSlide((s) => s + 1));
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete(numbers);
    }
  }, [slide, numbers, animateTransition, runPreview, onComplete]);

  const isLast = slide === TOTAL_SLIDES - 1;
  const needsDisclaimer = isLast && !disclaimerAccepted;
  const buttonLabels = ["Let's Find Out", 'Show My Results', 'Keep Going', 'Start Planning'];

  // Background gradient per slide
  const gradients: Record<number, string[]> = {
    0: ['#FFF0E5', '#FFF8F0', BRAND.bg],  // Warm peach
    1: [BRAND.bg, BRAND.bg, BRAND.bg],     // Clean
    2: ['#ECFDF5', '#F0FDFA', BRAND.bg],   // Fresh green
    3: ['#EFF6FF', '#F0F9FF', BRAND.bg],   // Calm blue
  };

  return (
    <SafeAreaView style={s.container}>
      <LinearGradient
        colors={gradients[slide] as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
      />

      {/* Progress bar */}
      <View style={s.progressBar}>
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <View key={i} style={[s.progressSegment, i <= slide && s.progressFilled]} />
        ))}
      </View>

      <View style={s.contentArea}>
        <Animated.View style={[s.slideWrap, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
          {slide === 0 && <SlideHook />}
          {slide === 1 && <SlideNumbers data={numbers} onChange={setNumbers} />}
          {slide === 2 && <SlideResults result={previewResult} loading={computing} />}
          {slide === 3 && <SlideLetsGo disclaimerAccepted={disclaimerAccepted} setDisclaimerAccepted={setDisclaimerAccepted} />}
        </Animated.View>
      </View>

      <View style={s.bottomSection}>
        <Pressable
          style={({ pressed }) => [
            s.actionButton,
            slide === 0 && s.actionButtonWarm,
            slide === 2 && s.actionButtonGreen,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            needsDisclaimer && s.actionButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={needsDisclaimer}
          accessibilityRole="button"
        >
          <Text style={[s.actionButtonText, needsDisclaimer && { color: '#A8A29E' }]}>
            {buttonLabels[slide]}
          </Text>
          {!needsDisclaimer && <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />}
        </Pressable>
        {slide === 0 && <Text style={s.footerNote}>Takes 60 seconds. No account needed.</Text>}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.bg },
  contentArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  slideWrap: { width: '100%' },
  center: { alignItems: 'center', width: '100%' },

  // Progress
  progressBar: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 12, gap: 6 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E7E5E4' },
  progressFilled: { backgroundColor: BRAND.sunset },

  // Hook
  hookContainer: { alignItems: 'center' },
  bigEmoji: { fontSize: 72, textAlign: 'center', marginBottom: 24 },
  hookTitle: { color: BRAND.text, fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 40, marginBottom: 12 },
  hookTitleAccent: { color: BRAND.sunset },
  hookSub: { color: BRAND.sunset, fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  tagRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tagGreen: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  tagGreenText: { color: '#059669', fontSize: 14, fontWeight: '600' },
  tagBlue: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8 },
  tagBlueText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
  hookDetail: { color: BRAND.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },

  // Demo preview card
  demoCard: {
    width: '100%',
    backgroundColor: BRAND.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    padding: 16,
    marginBottom: 20,
  },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  demoScoreBox: { flexDirection: 'row', alignItems: 'baseline' },
  demoScoreText: { fontSize: 36, fontWeight: '800', fontVariant: ['tabular-nums'] },
  demoScoreUnit: { fontSize: 18, fontWeight: '700', color: BRAND.textMuted, marginLeft: 1 },
  demoLabel: { color: BRAND.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  demoBarTrack: { height: 8, borderRadius: 4, backgroundColor: '#E7E5E4', overflow: 'hidden' },
  demoBarFill: { height: '100%', borderRadius: 4 },
  demoHint: { color: BRAND.textMuted, fontSize: 11, marginTop: 6 },

  // Numbers
  reactionBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  reactionEmoji: { fontSize: 20 },
  reactionText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: BRAND.text, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  sectionSub: { color: BRAND.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20 },
  sliderCard: { width: '100%', backgroundColor: BRAND.card, borderRadius: 20, borderWidth: 1, borderColor: BRAND.cardBorder, padding: 20 },
  sliderGroup: {},
  sliderDivider: { height: 1, backgroundColor: '#F5F0EB', marginVertical: 16 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sliderLabel: { color: BRAND.text, fontSize: 15, fontWeight: '500' },
  sliderValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  slider: { width: '100%', height: 40 },
  sliderRange: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeText: { color: BRAND.textMuted, fontSize: 11 },

  // Results
  loadingCenter: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: BRAND.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 12 },
  loadingSubText: { color: BRAND.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },
  scoreCard: { width: '100%', backgroundColor: BRAND.card, borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: BRAND.cardBorder },
  resultsLabel: { color: BRAND.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  bigScore: { fontSize: 80, fontWeight: '800', fontVariant: ['tabular-nums'], lineHeight: 88 },
  scoreMessage: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  scoreSub: { color: BRAND.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  freedomCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 16, padding: 16, marginBottom: 16, width: '100%' },
  freedomLabel: { color: '#059669', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  freedomDate: { color: '#059669', fontSize: 22, fontWeight: '800' },
  miniStatsRow: { flexDirection: 'row', alignItems: 'center' },
  miniStat: { alignItems: 'center', flex: 1 },
  miniStatValue: { color: BRAND.text, fontSize: 26, fontWeight: '700', fontVariant: ['tabular-nums'] },
  miniStatLabel: { color: BRAND.textMuted, fontSize: 12, marginTop: 2 },
  miniStatDivider: { width: 1, height: 32, backgroundColor: '#E7E5E4' },

  // Let's Go
  letsGoTitle: { color: BRAND.text, fontSize: 30, fontWeight: '800', textAlign: 'center', lineHeight: 38, marginBottom: 12 },
  letsGoSub: { color: BRAND.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 23, marginBottom: 24 },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 24 },
  trustPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: BRAND.card, borderRadius: 20, borderWidth: 1, borderColor: BRAND.cardBorder, paddingHorizontal: 14, paddingVertical: 8 },
  trustPillText: { color: BRAND.textSecondary, fontSize: 13, fontWeight: '500' },
  disclaimerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 4, gap: 10, width: '100%' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#D6D3D1', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  disclaimerText: { flex: 1, color: BRAND.textSecondary, fontSize: 13, lineHeight: 20 },

  // Button
  bottomSection: { paddingHorizontal: 24, paddingBottom: 36 },
  actionButton: { backgroundColor: BRAND.primary, paddingVertical: 17, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  actionButtonWarm: { backgroundColor: BRAND.sunset },
  actionButtonGreen: { backgroundColor: BRAND.success },
  actionButtonDisabled: { backgroundColor: '#E7E5E4' },
  actionButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  footerNote: { color: BRAND.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
