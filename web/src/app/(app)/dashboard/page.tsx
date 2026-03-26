"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSimStore } from "@/stores/useSimStore";
import { ConfidenceGauge } from "@/components/dashboard/ConfidenceGauge";
import { RunwayCard } from "@/components/dashboard/RunwayCard";
import { FreedomDateStrip } from "@/components/dashboard/FreedomDateStrip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SlidersHorizontal, Share2, Shield, LogOut, PauseCircle } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { result, simulate, profile } = useSimStore();

  useEffect(() => {
    if (!result) simulate();
  }, [result, simulate]);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleShare = async () => {
    const text = `My QuitSim score: ${result.quitConfidence}% confidence, ${result.runwayMonths} months runway. Find your freedom date at quitsim.it.com`;
    if (navigator.share) {
      await navigator.share({ title: "My QuitSim Results", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Your Quit Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.city}, {profile.state} &middot; {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(profile.salary)}/yr
          </p>
        </div>

        {/* Confidence Gauge */}
        <div className="flex justify-center">
          <ConfidenceGauge value={result.quitConfidence} />
        </div>

        {/* Runway + Freedom Date */}
        <RunwayCard months={result.runwayMonths} freedomDate={result.freedomDate} />

        {/* Freedom Date Calendar Strip */}
        <FreedomDateStrip freedomDate={result.freedomDate} />

        {/* Monte Carlo summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monte Carlo success rate</span>
                <span className="font-bold tabular-nums">{result.monteCarlo.successRate}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.monteCarlo.successRate}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Worst case: {result.monteCarlo.p10}mo</span>
                <span>Median: {result.monteCarlo.median}mo</span>
                <span>Best case: {result.monteCarlo.p90}mo</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 gap-3"
        >
          <Button
            size="lg"
            variant="destructive"
            className="h-16 text-lg font-bold"
            onClick={() => {
              router.push("/simulator");
              // Toast/visual cue
              if (typeof window !== "undefined") {
                const toast = document.createElement("div");
                toast.textContent = "Let\u2019s make sure you\u2019re ready";
                toast.className =
                  "fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground shadow-lg animate-in fade-in slide-in-from-top-2";
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
              }
            }}
          >
            <LogOut className="mr-2 h-6 w-6" />
            Quit Now
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => router.push("/practice")}
            >
              <PauseCircle className="mr-2 h-4 w-4" />
              Pause &amp; Plan
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => router.push("/simulator")}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Fine-tune my plan
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mx-auto"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share results
          </Button>
        </motion.div>

        {/* Privacy notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          All calculations run on-device. Your data never leaves your phone.
        </div>
      </motion.div>
    </div>
  );
}
