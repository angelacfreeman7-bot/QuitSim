"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSimStore } from "@/stores/useSimStore";
import { PRESETS } from "@/lib/sim/engine";
import { SimSlider } from "@/components/sim/SimSlider";
import { RunwayChart } from "@/components/sim/RunwayChart";
import { SankeyChart } from "@/components/sim/SankeyChart";
import { BeforeAfterToggle } from "@/components/sim/BeforeAfterToggle";
import { ShareCard } from "@/components/sim/ShareCard";
import { NarrativeCard } from "@/components/sim/NarrativeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingDown,
  DollarSign,
  Wallet,
  TrendingUp,
  MapPin,
  Zap,
  BriefcaseIcon,
  Baby,
  Flame,
  Laptop,
  Share2,
  Save,
  BarChart3,
  Percent,
  Crown,
} from "lucide-react";
import { canSavePlan, FREE_PLAN_LIMIT } from "@/lib/premium";
import { UpgradeGate } from "@/components/shared/UpgradeGate";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const presetIcons: Record<string, React.ReactNode> = {
  "job-loss": <BriefcaseIcon className="h-4 w-4" />,
  "baby-travel": <Baby className="h-4 w-4" />,
  "full-fire": <Flame className="h-4 w-4" />,
  "freelance-ramp": <Laptop className="h-4 w-4" />,
};

export default function SimulatorPage() {
  const { params, setParams, applyPreset, result, simulate, savePlan, plans, profile } = useSimStore();
  const [chartMode, setChartMode] = useState<"line" | "area">("area");
  const [planName, setPlanName] = useState("");
  const canSave = canSavePlan(plans.length);

  // Ensure result exists
  if (!result) {
    simulate();
    return null;
  }

  const handleShare = async () => {
    const text = `QuitSim Results: ${result.quitConfidence}% confidence, ${result.runwayMonths} months runway, ${result.monteCarlo.successRate}% Monte Carlo success. Try it at quitsim.it.com`;
    if (navigator.share) {
      await navigator.share({ title: "QuitSim Results", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleSave = () => {
    if (planName.trim()) {
      savePlan(planName.trim());
      setPlanName("");
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <h1 className="text-xl font-bold">Simulate Your Quit</h1>

        {/* Presets */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => applyPreset(preset.params)}
            >
              {presetIcons[preset.id]}
              {preset.name}
            </Button>
          ))}
        </div>

        {/* Sliders */}
        <Card>
          <CardContent className="space-y-6 py-5">
            <SimSlider
              label="Income Drop"
              icon={TrendingDown}
              value={params.incomeDropPct}
              onChange={(v) => setParams({ incomeDropPct: v })}
              min={0}
              max={100}
              step={5}
              suffix="%"
            />
            <SimSlider
              label="New Monthly Income"
              icon={DollarSign}
              value={params.newMonthlyIncome}
              onChange={(v) => setParams({ newMonthlyIncome: v })}
              min={0}
              max={20000}
              step={250}
              format={formatCurrency}
            />
            <SimSlider
              label="Additional Expenses"
              icon={Wallet}
              value={params.additionalExpenses}
              onChange={(v) => setParams({ additionalExpenses: v })}
              min={0}
              max={10000}
              step={100}
              format={formatCurrency}
            />
            <SimSlider
              label="Savings Rate"
              icon={Percent}
              value={params.savingsRate}
              onChange={(v) => setParams({ savingsRate: v })}
              min={0}
              max={50}
              step={5}
              suffix="%"
            />
            <SimSlider
              label="Investment Return"
              icon={TrendingUp}
              value={params.investmentReturn}
              onChange={(v) => setParams({ investmentReturn: v })}
              min={-10}
              max={20}
              step={0.5}
              suffix="%"
            />
            <SimSlider
              label="Cost of Living Change"
              icon={MapPin}
              value={params.colChange}
              onChange={(v) => setParams({ colChange: v })}
              min={-50}
              max={50}
              step={5}
              suffix="%"
            />

            {/* Black Swan Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <Label className="text-sm">Black Swan Events</Label>
              </div>
              <Switch
                checked={params.blackSwan}
                onCheckedChange={(v) => setParams({ blackSwan: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="border-border/50">
            <CardContent className="py-3 text-center">
              <p className="text-2xl font-bold tabular-nums">{result.quitConfidence}%</p>
              <p className="text-[10px] text-muted-foreground">Confidence</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-3 text-center">
              <p className="text-2xl font-bold tabular-nums">{result.runwayMonths}</p>
              <p className="text-[10px] text-muted-foreground">Months</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="py-3 text-center">
              <p className="text-2xl font-bold tabular-nums">{result.monteCarlo.successRate}%</p>
              <p className="text-[10px] text-muted-foreground">Monte Carlo</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Financial Projection</span>
              </div>
              <div className="flex gap-1">
                <Badge
                  variant={chartMode === "line" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setChartMode("line")}
                >
                  Line
                </Badge>
                <Badge
                  variant={chartMode === "area" ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setChartMode("area")}
                >
                  Area
                </Badge>
              </div>
            </div>
            <RunwayChart data={result.months} mode={chartMode} monteCarlo={result.monteCarlo} />
          </CardContent>
        </Card>

        {/* Sankey Flow */}
        <Card>
          <CardContent className="py-4">
            <SankeyChart
              result={result}
              monthlyExpenses={profile.monthlyExpenses}
            />
          </CardContent>
        </Card>

        {/* Before / After Toggle */}
        <BeforeAfterToggle
          before={{
            income: Math.round(profile.salary / 12),
            expenses: profile.monthlyExpenses,
            savings: Math.round(profile.salary / 12 - profile.monthlyExpenses),
            netWorth: profile.savings + profile.investments - profile.debt,
          }}
          after={{
            income: result.months[0]?.income ?? 0,
            expenses: result.months[0]?.expenses ?? 0,
            savings: result.months[0]?.netCashflow ?? 0,
            netWorth: result.months[11]?.totalNetWorth ?? 0,
          }}
        />

        {/* AI Narrative */}
        <UpgradeGate feature="AI-powered narrative insights" locked={false}>
          <NarrativeCard result={result} />
        </UpgradeGate>

        {/* Shareable Results Card */}
        <ShareCard
          result={result}
          city={profile.city}
          state={profile.state}
        />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          {canSave ? (
            <Dialog>
              <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-12 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <Save className="mr-2 h-4 w-4" />
                Save Plan ({plans.length}/{FREE_PLAN_LIMIT})
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save this plan</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="My quit plan"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
                <DialogFooter>
                  <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              variant="outline"
              className="h-12"
              onClick={() => window.alert("Upgrade flow coming soon! This will connect to Stripe.")}
            >
              <Crown className="mr-2 h-4 w-4 text-primary" />
              Upgrade ({FREE_PLAN_LIMIT}/{FREE_PLAN_LIMIT})
            </Button>
          )}
          <Button variant="outline" className="h-12" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
