"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSimStore } from "@/stores/useSimStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SimSlider } from "@/components/sim/SimSlider";
import {
  Lock,
  Unlock,
  Trash2,
  SlidersHorizontal,
  FileText,
  Users,
  Crown,
  DollarSign,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { canUseCouplesMode } from "@/lib/premium";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function LibraryPage() {
  const router = useRouter();
  const { plans, deletePlan, lockPlan, couplesMode, toggleCouplesMode, setParams, simulate, profile, setProfile } = useSimStore();

  const loadPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setParams(plan.params);
      simulate();
      router.push("/simulator");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Saved Plans</h1>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label className="text-xs">Couples</Label>
            {canUseCouplesMode() ? (
              <Switch checked={couplesMode} onCheckedChange={toggleCouplesMode} />
            ) : (
              <button
                onClick={() => window.alert("Upgrade flow coming soon! This will connect to Stripe.")}
                className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
              >
                <Crown className="h-3 w-3" />
                Pro
              </button>
            )}
          </div>
        </div>

        {/* Partner financials (shown when couples mode active) */}
        <AnimatePresence>
          {couplesMode && profile.partner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-5 space-y-4">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Partner&apos;s Financials
                  </p>
                  <SimSlider
                    label="Partner Salary"
                    icon={DollarSign}
                    value={profile.partner.salary}
                    onChange={(v) =>
                      setProfile({ partner: { ...profile.partner!, salary: v } })
                    }
                    min={0}
                    max={300000}
                    step={5000}
                    format={formatCurrency}
                  />
                  <SimSlider
                    label="Partner Savings"
                    icon={PiggyBank}
                    value={profile.partner.savings}
                    onChange={(v) =>
                      setProfile({ partner: { ...profile.partner!, savings: v } })
                    }
                    min={0}
                    max={500000}
                    step={5000}
                    format={formatCurrency}
                  />
                  <SimSlider
                    label="Partner Expenses"
                    icon={Wallet}
                    value={profile.partner.monthlyExpenses}
                    onChange={(v) =>
                      setProfile({ partner: { ...profile.partner!, monthlyExpenses: v } })
                    }
                    min={0}
                    max={15000}
                    step={250}
                    format={formatCurrency}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {plans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-2">No saved plans yet</p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Run a simulation and save it to compare scenarios.
            </p>
            <Button onClick={() => router.push("/simulator")}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Create a simulation
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`border-border/50 ${plan.locked ? "border-primary/30" : ""}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {plan.name}
                            {plan.locked && <Lock className="h-3 w-3 text-primary" />}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs tabular-nums">
                            {plan.result.quitConfidence}%
                          </Badge>
                          <Badge variant="secondary" className="text-xs tabular-nums">
                            {plan.result.runwayMonths}mo
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Income drop</p>
                          <p className="text-sm font-medium tabular-nums">{plan.params.incomeDropPct}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">New income</p>
                          <p className="text-sm font-medium tabular-nums">
                            ${(plan.params.newMonthlyIncome / 1000).toFixed(1)}k
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monte Carlo</p>
                          <p className="text-sm font-medium tabular-nums">{plan.result.monteCarlo.successRate}%</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => loadPlan(plan.id)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => lockPlan(plan.id)}
                        >
                          {plan.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePlan(plan.id)}
                          disabled={plan.locked}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
