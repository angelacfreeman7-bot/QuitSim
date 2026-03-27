import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSimStore } from '../stores/useSimStore';
import { useTheme } from '../lib/theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 3;

interface StepConfig {
  title: string;
  emoji: string;
  subtitle: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    hint?: string;
  }[];
}

const STEPS: StepConfig[] = [
  {
    title: 'Your income',
    emoji: '💰',
    subtitle: 'The paycheck you\u2019d give up. Rough is fine \u2014 you can always tweak it.',
    fields: [
      { key: 'salary', label: 'Yearly Pay (Before Taxes)', placeholder: '0', hint: 'Your total yearly pay before deductions. Check your pay stub and multiply by how often you\u2019re paid.' },
    ],
  },
  {
    title: 'Your cushion',
    emoji: '🏦',
    subtitle: 'The money that keeps you going if you stop working.',
    fields: [
      { key: 'savings', label: 'Cash You Can Use Now', placeholder: '0', hint: 'Checking, savings, anything easy to access and spend today.' },
      { key: 'investments', label: 'Retirement & Investments', placeholder: '0', hint: '401k, IRA, stocks \u2014 it\u2019s okay to guess. You can update later.' },
    ],
  },
  {
    title: 'Your burn rate',
    emoji: '🔥',
    subtitle: 'How fast your savings would run out. This is the most important number.',
    fields: [
      { key: 'monthlyExpenses', label: 'Monthly Spending', placeholder: '0', hint: 'Housing, food, phone, transport, subscriptions \u2014 all of it. Tip: check your bank app.' },
      { key: 'debt', label: 'Total Debt', placeholder: '0', hint: 'Credit cards, student loans, car loans. Zero is great \u2014 just leave it.' },
    ],
  },
];

function formatCurrency(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('en-US');
}

const MAX_VALUE = 99_999_999;

function parseCurrency(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, '');
  const value = cleaned ? parseInt(cleaned, 10) : 0;
  return Math.min(value, MAX_VALUE);
}

export function OnboardingScreen() {
  const BRAND = useTheme();
  const setProfile = useSimStore((s) => s.setProfile);
  const setOnboarded = useSimStore((s) => s.setOnboarded);
  const simulate = useSimStore((s) => s.simulate);

  const [step, setStep] = useState(0);
  const profile = useSimStore((s) => s.profile);
  const [values, setValues] = useState<Record<string, number>>({
    salary: profile.salary || 0,
    savings: profile.savings || 0,
    investments: profile.investments || 0,
    monthlyExpenses: profile.monthlyExpenses || 0,
    debt: profile.debt || 0,
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = useCallback(
    (direction: 'forward' | 'back', callback: () => void) => {
      const exitX = direction === 'forward' ? -SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.3;
      const enterX = direction === 'forward' ? SCREEN_WIDTH * 0.3 : -SCREEN_WIDTH * 0.3;

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: exitX,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        callback();
        slideAnim.setValue(enterX);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim],
  );

  const validateStep = useCallback((): boolean => {
    if (step === 0 && values.salary <= 0) {
      Alert.alert('How much do you earn?', 'We need your yearly pay to figure out your results. Even a rough guess works \u2014 you can change it later.');
      return false;
    }
    if (step === 2 && values.monthlyExpenses <= 0) {
      Alert.alert('How much do you spend?', 'We need a rough idea of what you spend each month. Tip: check your bank app for last month\u2019s total.');
      return false;
    }
    return true;
  }, [step, values]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      animateTransition('forward', () => setStep((s) => s + 1));
    } else {
      // Final step — commit profile and finish
      setProfile({
        salary: values.salary,
        savings: values.savings,
        investments: values.investments,
        monthlyExpenses: values.monthlyExpenses,
        debt: values.debt,
      });
      setOnboarded(true);
      simulate();
    }
  }, [step, values, validateStep, animateTransition, setProfile, setOnboarded, simulate]);

  const handleBack = useCallback(() => {
    if (step > 0) {
      animateTransition('back', () => setStep((s) => s - 1));
    }
  }, [step, animateTransition]);

  const updateValue = useCallback((key: string, text: string) => {
    setValues((prev) => ({ ...prev, [key]: parseCurrency(text) }));
  }, []);

  const currentStep = STEPS[step];
  const isLast = step === TOTAL_STEPS - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.bg }]}>
      <LinearGradient
        colors={BRAND.isDark ? [BRAND.bg, BRAND.bg, BRAND.bg] : ['#FFF7ED', '#FFFBF7', BRAND.bg]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Progress bar */}
          <View style={styles.progressRow} accessible accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${TOTAL_STEPS}`} accessibilityValue={{ min: 1, max: TOTAL_STEPS, now: step + 1 }}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.progressSegment, { backgroundColor: BRAND.isDark ? '#292524' : '#E7E5E4' }, i <= step && { backgroundColor: BRAND.sunset }]} />
            ))}
          </View>

          {/* Step label */}
          <Text style={[styles.stepLabel, { color: BRAND.textMuted }]}>
            Fine-tuning {step + 1} of {TOTAL_STEPS}
          </Text>

          {/* Animated content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Text style={styles.stepEmoji}>{currentStep.emoji}</Text>
            <Text style={[styles.title, { color: BRAND.text }]}>{currentStep.title}</Text>
            <Text style={[styles.subtitle, { color: BRAND.textMuted }]}>{currentStep.subtitle}</Text>

            <View style={styles.fieldsContainer}>
              {currentStep.fields.map((field) => (
                <View key={field.key} style={styles.fieldWrapper}>
                  <Text style={[styles.fieldLabel, { color: BRAND.textSecondary }]}>{field.label}</Text>
                  <View style={[styles.inputRow, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
                    <Text style={[styles.dollarSign, { color: BRAND.sunset }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: BRAND.text }]}
                      keyboardType="numeric"
                      placeholder={field.placeholder}
                      placeholderTextColor={BRAND.textMuted}
                      value={formatCurrency(values[field.key])}
                      onChangeText={(text) => updateValue(field.key, text)}
                      returnKeyType="done"
                      selectionColor={BRAND.primary}
                      accessibilityLabel={field.label}
                      accessibilityHint={field.hint}
                    />
                  </View>
                  {field.hint && (
                    <Text style={[styles.fieldHint, { color: BRAND.textMuted }]}>{field.hint}</Text>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Navigation */}
          <View style={styles.buttonRow}>
            {step > 0 ? (
              <Pressable
                style={[styles.backButton, { borderColor: BRAND.cardBorder }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleBack();
                }}
              >
                <Ionicons name="arrow-back" size={18} color={BRAND.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.backButtonText, { color: BRAND.textMuted }]}>Back</Text>
              </Pressable>
            ) : (
              <View style={styles.backPlaceholder} />
            )}

            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleNext();
              }}
              accessibilityRole="button"
              accessibilityLabel={isLast ? "Let's go — start simulation" : 'Next step'}
            >
              <Text style={styles.nextButtonText}>
                {isLast ? "Let's Go!" : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  fieldsContainer: {
    width: '100%',
    gap: 20,
  },
  fieldWrapper: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 60,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 0,
  },
  fieldHint: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backPlaceholder: {
    width: 80,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nextButtonPressed: {
    opacity: 0.9,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
