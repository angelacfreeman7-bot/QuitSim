"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useSimStore } from "@/stores/useSimStore";
import { getTodayChallenge, getUpcomingChallenges, CHALLENGES } from "@/lib/sim/challenges";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  CheckCircle2,
  Lock,
  PiggyBank,
  DollarSign,
  BookOpen,
  Brain,
  Trophy,
} from "lucide-react";

const categoryIcons = {
  save: PiggyBank,
  earn: DollarSign,
  learn: BookOpen,
  mindset: Brain,
};

const categoryColors = {
  save: "text-green-500",
  earn: "text-blue-500",
  learn: "text-purple-500",
  mindset: "text-orange-500",
};

export default function PracticePage() {
  const { streak, completeChallenge, result, savePlan, lockPlan, plans } = useSimStore();
  const todayChallenge = getTodayChallenge();
  const upcoming = getUpcomingChallenges(4);
  const isCompleted = streak.completedChallenges.includes(todayChallenge.id);

  const totalXP = streak.completedChallenges.reduce((sum, id) => {
    const c = CHALLENGES.find((ch) => ch.id === id);
    return sum + (c?.xp ?? 20);
  }, 0);

  const handleComplete = useCallback(() => {
    completeChallenge(todayChallenge.id);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#22c55e", "#3b82f6", "#a855f7", "#eab308"],
    });
  }, [completeChallenge, todayChallenge.id]);

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <h1 className="text-xl font-bold">Practice Quitting</h1>
        <p className="text-sm text-muted-foreground">
          Daily micro-challenges to build your financial freedom muscle.
        </p>

        {/* Streak + XP */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{streak.current}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{totalXP}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`border-2 ${isCompleted ? "border-green-500/30 bg-green-500/5" : "border-primary/30 bg-primary/5"}`}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-xs">
                  Today&apos;s Challenge
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  +{todayChallenge.xp} XP
                </Badge>
              </div>
              <div className="flex items-start gap-3 mb-4">
                {(() => {
                  const Icon = categoryIcons[todayChallenge.category];
                  return <Icon className={`h-6 w-6 shrink-0 ${categoryColors[todayChallenge.category]}`} />;
                })()}
                <div>
                  <h3 className="font-semibold text-lg">{todayChallenge.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{todayChallenge.description}</p>
                </div>
              </div>
              <Button
                className="w-full h-12"
                disabled={isCompleted}
                onClick={handleComplete}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Completed!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Mark as Done
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lock Plan CTA */}
        {result && result.quitConfidence >= 60 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              className="w-full h-12 border-primary/30"
              onClick={() => {
                const name = `Locked Plan — ${result.quitConfidence}% confidence`;
                savePlan(name);
                const savedPlans = useSimStore.getState().plans;
                const newest = savedPlans[savedPlans.length - 1];
                if (newest) lockPlan(newest.id);
              }}
              disabled={plans.some((p) => p.locked)}
            >
              <Lock className="mr-2 h-4 w-4" />
              {plans.some((p) => p.locked)
                ? "Plan locked — you\u2019re committed"
                : "Lock this plan — I\u2019m committing"}
            </Button>
          </motion.div>
        )}

        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Coming Up</h2>
          <div className="space-y-2">
            {upcoming.map((challenge, i) => {
              const Icon = categoryIcons[challenge.category];
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="border-border/30">
                    <CardContent className="flex items-center gap-3 py-3">
                      <Icon className={`h-4 w-4 ${categoryColors[challenge.category]}`} />
                      <span className="text-sm flex-1">{challenge.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        +{challenge.xp} XP
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Weekly progress</span>
              <span className="text-sm font-bold">{Math.min(streak.current, 7)}/7</span>
            </div>
            <Progress value={Math.min((streak.current / 7) * 100, 100)} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
