import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSimStore } from '../stores/useSimStore';
import {
  getTodayChallenge,
  getUpcomingChallenges,
  CHALLENGES,
} from '../lib/challenges';
import { useTheme } from '../lib/theme';
import * as Haptics from 'expo-haptics';

const categoryColors: Record<string, string> = {
  save: '#34d399',
  earn: '#38bdf8',
  learn: '#c084fc',
  mindset: '#FBBF24',
};

const categoryEmoji: Record<string, string> = {
  save: '🐷',
  earn: '💵',
  learn: '📖',
  mindset: '🧠',
};

export function PracticeScreen() {
  const BRAND = useTheme();
  const { streak, completeChallenge, result, savePlan, lockPlan, plans } =
    useSimStore();
  const todayChallenge = getTodayChallenge();
  const upcoming = getUpcomingChallenges(4);
  const isCompleted = streak.completedChallenges.includes(todayChallenge.id);

  const totalXP = streak.completedChallenges.reduce((sum, id) => {
    const c = CHALLENGES.find((ch) => ch.id === id);
    return sum + (c?.xp ?? 20);
  }, 0);

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeChallenge(todayChallenge.id);
    Alert.alert('🎉 Nice work!', `+${todayChallenge.xp} XP earned`, [
      { text: 'Keep going!' },
    ]);
  };

  const handleLockPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!result) return;
    const name = `Locked Plan — ${result.quitConfidence}% confidence`;
    savePlan(name);
    const newest = useSimStore.getState().plans;
    const last = newest[newest.length - 1];
    if (last) lockPlan(last.id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BRAND.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: BRAND.text }]}>Daily Actions</Text>
        <Text style={[styles.subtitle, { color: BRAND.textSecondary }]}>
          Small things you can do each day to get closer to quitting. Complete them to earn XP and keep your streak going!
        </Text>

        {/* Streak + XP */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statBig, { color: BRAND.text }]}>{streak.current}</Text>
            <Text style={[styles.statLabel, { color: BRAND.textMuted }]}>Day streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statBig, { color: BRAND.text }]}>{totalXP}</Text>
            <Text style={[styles.statLabel, { color: BRAND.textMuted }]}>Total XP</Text>
          </View>
        </View>

        {/* Today's Challenge */}
        <View
          style={[
            styles.todayCard,
            isCompleted ? styles.todayCompleted : { backgroundColor: BRAND.primaryLight, borderColor: BRAND.primaryBorder },
          ]}
        >
          <View style={styles.todayHeader}>
            <View style={[styles.todayBadge, { borderColor: BRAND.cardBorder }]}>
              <Text style={[styles.todayBadgeText, { color: BRAND.textSecondary }]}>Today's Challenge</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+{todayChallenge.xp} XP</Text>
            </View>
          </View>

          <View style={styles.todayContent}>
            <Text style={styles.categoryEmoji}>
              {categoryEmoji[todayChallenge.category]}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.challengeTitle, { color: BRAND.text }]}>{todayChallenge.title}</Text>
              <Text style={[styles.challengeDesc, { color: BRAND.textSecondary }]}>
                {todayChallenge.description}
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.completeButton,
              { backgroundColor: BRAND.primary },
              isCompleted && { backgroundColor: BRAND.cardBorder },
            ]}
            onPress={handleComplete}
            disabled={isCompleted}
            accessibilityRole="button"
            accessibilityLabel={isCompleted ? 'Challenge completed' : 'Mark challenge as done'}
            accessibilityState={{ disabled: isCompleted }}
          >
            <Text
              style={[
                styles.completeButtonText,
                isCompleted && { color: BRAND.textMuted },
              ]}
            >
              {isCompleted ? '✅  Completed!' : '✅  Mark as Done'}
            </Text>
          </Pressable>
        </View>

        {/* Lock Plan CTA */}
        {result && result.quitConfidence >= 60 && (
          <>
            <Pressable
              style={[
                styles.lockButton,
                plans.some((p) => p.locked) && styles.lockButtonDisabled,
              ]}
              onPress={handleLockPlan}
              disabled={plans.some((p) => p.locked)}
            >
              <Text style={[styles.lockButtonText, { color: BRAND.text }]}>
                {plans.some((p) => p.locked)
                  ? '🔒  You\u2019re committed — plan saved'
                  : '🔒  Commit to this plan'}
              </Text>
            </Pressable>
            {!plans.some((p) => p.locked) && (
              <Text style={[styles.lockSubtitle, { color: BRAND.textMuted }]}>This saves your current numbers as your official plan. Think of it like setting a goal — you can always make new ones later.</Text>
            )}
          </>
        )}

        {/* Coming Up */}
        <Text style={[styles.sectionTitle, { color: BRAND.textSecondary }]}>Coming Up</Text>
        {upcoming.map((challenge) => (
          <View key={challenge.id} style={[styles.upcomingCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}>
            <Text style={styles.upcomingEmoji}>
              {categoryEmoji[challenge.category]}
            </Text>
            <Text style={[styles.upcomingTitle, { color: BRAND.text }]}>{challenge.title}</Text>
            <View style={[styles.upcomingXP, { borderColor: BRAND.cardBorder }]}>
              <Text style={[styles.upcomingXPText, { color: BRAND.textMuted }]}>+{challenge.xp} XP</Text>
            </View>
          </View>
        ))}

        {/* Weekly Progress */}
        <View
          style={[styles.progressCard, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`Weekly progress: ${Math.min(streak.current, 7)} of 7 days`}
          accessibilityValue={{ min: 0, max: 7, now: Math.min(streak.current, 7) }}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: BRAND.text }]}>Weekly progress</Text>
            <Text style={[styles.progressCount, { color: BRAND.text }]}>
              {Math.min(streak.current, 7)}/7
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: BRAND.cardBorder }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((streak.current / 7) * 100, 100)}%`, backgroundColor: BRAND.primary },
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 20 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statBig: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabel: { fontSize: 11, marginTop: 2 },

  // Today's challenge
  todayCard: { borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2 },
  todayCompleted: {
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  todayBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  todayBadgeText: { fontSize: 11 },
  xpBadge: { backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  xpBadgeText: { color: '#FBBF24', fontSize: 11, fontWeight: '600' },
  todayContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  categoryEmoji: { fontSize: 24 },
  challengeTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  challengeDesc: { fontSize: 13, lineHeight: 18 },
  completeButton: {
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // Lock plan
  lockButton: {
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockButtonDisabled: { opacity: 0.5 },
  lockButtonText: { fontSize: 13, fontWeight: '500' },
  lockSubtitle: { fontSize: 11, textAlign: 'center', marginTop: 6, marginBottom: 24 },

  // Coming up
  sectionTitle: { fontSize: 13, fontWeight: '500', marginBottom: 10 },
  upcomingCard: {
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
  },
  upcomingEmoji: { fontSize: 16 },
  upcomingTitle: { fontSize: 13, flex: 1 },
  upcomingXP: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  upcomingXPText: { fontSize: 10 },

  // Progress
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 13 },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
