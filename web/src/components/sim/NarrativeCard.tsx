"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, AlertTriangle, Lightbulb, ShieldCheck } from "lucide-react";
import { SimResult } from "@/types";

interface NarrativeCardProps {
  result: SimResult;
}

function generateLocalNarrative(result: SimResult) {
  const { runwayMonths, quitConfidence, monteCarlo, months } = result;

  // Find danger month
  const dangerMonth = months.find((m) => m.totalNetWorth < m.expenses * 2);
  const dangerIdx = dangerMonth?.month;

  let summary = "";
  if (quitConfidence >= 70) {
    summary = `You're in solid shape. With ${runwayMonths} months of runway and a ${monteCarlo.successRate}% Monte Carlo success rate, you have a real shot at making this work.`;
  } else if (quitConfidence >= 40) {
    summary = `You're getting there, but not bulletproof yet. Your ${runwayMonths}-month runway gives you breathing room, but the ${monteCarlo.successRate}% success rate means there's meaningful risk.`;
  } else {
    summary = `Honest truth: quitting today would be risky. With only ${runwayMonths} months of runway and a ${monteCarlo.successRate}% chance of lasting 2 years, you need a stronger cushion.`;
  }

  const warnings: string[] = [];
  if (dangerIdx) {
    warnings.push(`Month ${dangerIdx}: your net worth dips dangerously close to your monthly expenses. One surprise bill could tip you over.`);
  }
  if (monteCarlo.p10 < 6) {
    warnings.push(`In a bad-luck scenario (10th percentile), you'd only last ${monteCarlo.p10} months.`);
  }

  const suggestions: string[] = [];
  if (quitConfidence < 70) {
    const neededSavings = Math.round(months[0].expenses * 12 - months[0].savings);
    if (neededSavings > 0) {
      suggestions.push(`Save another ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(neededSavings)} to hit a 12-month cushion.`);
    }
    suggestions.push("Consider starting a side income stream before quitting to reduce the income drop.");
  }
  if (runwayMonths < 12) {
    suggestions.push("Cut $500/mo in discretionary spending to extend your runway by several months.");
  }

  return { summary, warnings, suggestions, monthOfRisk: dangerIdx || null };
}

export function NarrativeCard({ result }: NarrativeCardProps) {
  const [narrative, setNarrative] = useState<ReturnType<typeof generateLocalNarrative> | null>(null);

  const generate = useCallback(() => {
    setNarrative(generateLocalNarrative(result));
  }, [result]);

  useEffect(() => {
    generate();
  }, [generate]);

  if (!narrative) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-5 space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{narrative.summary}</p>
          </div>

          <AnimatePresence>
            {narrative.warnings.map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 text-sm"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{w}</p>
              </motion.div>
            ))}
          </AnimatePresence>

          {narrative.suggestions.length > 0 && (
            <div className="space-y-2 border-t border-border/50 pt-3">
              {narrative.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Lightbulb className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-border/30 pt-3">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              Insights generated on-device. No financial data is sent externally.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
