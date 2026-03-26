"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface BeforeAfterToggleProps {
  before: {
    income: number;
    expenses: number;
    savings: number;
    netWorth: number;
  };
  after: {
    income: number;
    expenses: number;
    savings: number;
    netWorth: number;
  };
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

const DeltaBadge = ({ before, after }: { before: number; after: number }) => {
  const diff = after - before;
  const pct = before !== 0 ? Math.round((diff / Math.abs(before)) * 100) : 0;
  const isPositive = diff >= 0;

  return (
    <span
      className={`text-[10px] font-medium ${
        isPositive ? "text-green-400" : "text-red-400"
      }`}
    >
      {isPositive ? "+" : ""}
      {pct}%
    </span>
  );
};

export function BeforeAfterToggle({ before, after }: BeforeAfterToggleProps) {
  const [showAfter, setShowAfter] = useState(false);

  const rows = [
    { label: "Monthly Income", beforeVal: before.income, afterVal: after.income },
    { label: "Monthly Expenses", beforeVal: before.expenses, afterVal: after.expenses },
    { label: "Monthly Savings", beforeVal: before.savings, afterVal: after.savings },
    { label: "Net Worth (12mo)", beforeVal: before.netWorth, afterVal: after.netWorth },
  ];

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setShowAfter(false)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            !showAfter
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Before Quitting
        </button>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <button
          onClick={() => setShowAfter(true)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
            showAfter
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          After Quitting
        </button>
      </div>

      {/* Comparison cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={showAfter ? "after" : "before"}
          initial={{ opacity: 0, x: showAfter ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showAfter ? -20 : 20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/50">
            <CardContent className="py-4 space-y-3">
              {rows.map((row) => {
                const currentVal = showAfter ? row.afterVal : row.beforeVal;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums">
                        {formatCurrency(currentVal)}
                      </span>
                      {showAfter && (
                        <DeltaBadge
                          before={row.beforeVal}
                          after={row.afterVal}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Side-by-side mini view */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            !showAfter ? "border-primary/40 bg-primary/5" : "border-border/30"
          }`}
          onClick={() => setShowAfter(false)}
        >
          <p className="text-[10px] text-muted-foreground">Before</p>
          <p className="text-lg font-bold tabular-nums">
            {formatCurrency(before.netWorth)}
          </p>
          <p className="text-[10px] text-muted-foreground">12mo net worth</p>
        </div>
        <div
          className={`rounded-lg border p-3 text-center transition-colors cursor-pointer ${
            showAfter ? "border-primary/40 bg-primary/5" : "border-border/30"
          }`}
          onClick={() => setShowAfter(true)}
        >
          <p className="text-[10px] text-muted-foreground">After</p>
          <p
            className={`text-lg font-bold tabular-nums ${
              after.netWorth < 0 ? "text-red-400" : ""
            }`}
          >
            {formatCurrency(after.netWorth)}
          </p>
          <p className="text-[10px] text-muted-foreground">12mo net worth</p>
        </div>
      </div>
    </div>
  );
}
