import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../lib/theme';
import * as Haptics from 'expo-haptics';

interface FAQItem {
  question: string;
  answer: string;
  emoji: string;
}

const FAQ_SECTIONS: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    items: [
      {
        emoji: '🤔',
        question: 'What is QuitSim?',
        answer: 'QuitSim is a financial simulator that helps you figure out when you could quit your job. It runs hundreds of scenarios using your real numbers to give you a confidence score, a "freedom date," and a plan to get there.',
      },
      {
        emoji: '🏠',
        question: 'How does the app work?',
        answer: 'You enter your income, savings, and spending. QuitSim runs Monte Carlo simulations (the same math Wall Street uses) to stress-test your finances. It shows you how long your money would last, what could go wrong, and what moves would help the most.',
      },
      {
        emoji: '📱',
        question: "What are the main screens?",
        answer: "Home — Your dashboard with your freedom date, confidence score, and personalized tips.\n\nExplore — The \"what if\" simulator. Slide settings to see how changes (side income, moving cheaper, cutting expenses) affect your timeline.\n\nPlans — Save and compare different scenarios. \"What if I freelance?\" vs \"What if I cut spending?\"\n\nPractice — Daily micro-challenges to build better money habits.",
      },
    ],
  },
  {
    title: 'Your Numbers',
    items: [
      {
        emoji: '🎯',
        question: 'What does the confidence score mean?',
        answer: "It's a readiness grade from 0 to 100:\n\n• 70%+ — Your finances look solid. You could likely quit and be okay.\n• 40–70% — You're on your way. A few changes could make a big difference.\n• Under 40% — You're building the foundation. Everyone starts somewhere.\n\nIt factors in how long your money lasts, how it handles surprises, and your savings cushion.",
      },
      {
        emoji: '🌅',
        question: 'What is the Freedom Date?',
        answer: 'The earliest month we estimate you could quit and still be financially okay. It\'s based on your savings, spending rate, and how your money might grow. If no date shows, it means the numbers don\'t work yet — use the Explore tab to find moves that help.',
      },
      {
        emoji: '🎲',
        question: 'What is the "What If" score?',
        answer: 'We run your plan hundreds of times with random bad luck thrown in — market crashes, surprise medical bills, job loss during your transition. This score shows how often your plan still works. 80%+ means your plan is solid even when life throws curveballs.',
      },
      {
        emoji: '📊',
        question: 'How accurate are the simulations?',
        answer: "They're based on real financial math (Monte Carlo analysis), but they're simplified models. They don't account for taxes, healthcare costs, inflation nuances, or your specific investment mix. Think of it as a strong starting point — not a replacement for a financial advisor.",
      },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      {
        emoji: '🔒',
        question: 'Is my financial data safe?',
        answer: 'Yes. All your data stays on your phone. We never see your salary, savings, or spending. Nothing is sent to any server. All calculations run locally on your device.',
      },
      {
        emoji: '🗑️',
        question: 'What happens if I delete the app?',
        answer: 'All your data is permanently gone. We don\'t keep backups because we never had your data in the first place. If you want to start fresh without deleting, use "Reset All Data" in Settings.',
      },
      {
        emoji: '📈',
        question: 'What data do you collect?',
        answer: 'We collect anonymous usage analytics (which screens you visit, how often you run simulations) and crash reports to fix bugs. None of this includes your financial data. See our full Privacy Policy in Settings.',
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        emoji: '🎪',
        question: 'What is Fun Mode?',
        answer: 'After running a few simulations, you unlock Fun Mode in the Explore tab. It lets you try fantasy scenarios — "What if I won the lottery?" or "What if I moved to Bali?" — just for fun. These are clearly marked as fantasies, not financial advice.',
      },
      {
        emoji: '🔥',
        question: 'How do Daily Challenges work?',
        answer: "Each day you get small, actionable money challenges — like \"Check your subscriptions\" or \"Pack lunch today.\" Complete them to build streaks and good habits. They're designed to be quick (under 5 minutes) and genuinely helpful.",
      },
      {
        emoji: '💾',
        question: 'How do saved plans work?',
        answer: 'When you find a scenario you like in the Explore tab, save it with a name. You can compare multiple plans side-by-side in the Plans tab to see which path gets you to freedom fastest.',
      },
      {
        emoji: '👫',
        question: 'What is Couples Mode?',
        answer: "A Pro feature that lets you factor in a partner's income, savings, and expenses. It simulates your combined finances so you can plan together.",
      },
    ],
  },
];

function FAQRow({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[styles.faqRow, expanded && styles.faqRowExpanded]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded(!expanded);
      }}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqEmoji}>{item.emoji}</Text>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={expanded ? BRAND.primary : BRAND.textMuted}
        />
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </Pressable>
  );
}

export function FAQScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={BRAND.textSecondary} />
          </Pressable>
          <Text style={styles.title}>FAQ</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.heroEmoji}>💡</Text>
        <Text style={styles.heroText}>Everything you need to know</Text>

        {FAQ_SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.section}>
              {section.items.map((item, i) => (
                <View key={item.question}>
                  {i > 0 && <View style={styles.divider} />}
                  <FAQRow item={item} />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Still have questions?</Text>
          <Pressable
            style={styles.contactButton}
            onPress={() => {
              const { Linking } = require('react-native');
              Linking.openURL('mailto:support@quitsim.it.com?subject=QuitSim%20Question');
            }}
          >
            <Ionicons name="mail-outline" size={16} color={BRAND.primary} />
            <Text style={styles.contactText}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BRAND.bg },
  scroll: { paddingHorizontal: 24, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { color: BRAND.text, fontSize: 18, fontWeight: '700' },
  heroEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  heroText: { color: BRAND.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 24 },
  sectionTitle: {
    color: '#78716C',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: BRAND.cardBorder,
    marginLeft: 52,
  },
  faqRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqRowExpanded: {
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  faqEmoji: { fontSize: 20 },
  faqQuestion: {
    flex: 1,
    color: BRAND.text,
    fontSize: 15,
    fontWeight: '600',
  },
  faqAnswer: {
    color: BRAND.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginLeft: 30,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
  },
  footerText: { color: '#78716C', fontSize: 14 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: BRAND.primaryBorder,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  contactText: { color: BRAND.primary, fontSize: 14, fontWeight: '600' },
});
