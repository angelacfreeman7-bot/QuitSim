"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface FreedomDateStripProps {
  freedomDate: string | null;
}

export function FreedomDateStrip({ freedomDate }: FreedomDateStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const freedom = freedomDate ? new Date(freedomDate) : null;

  // Generate next 18 months
  const months = Array.from({ length: 18 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    return {
      key: d.toISOString(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      isToday: i === 0,
      isFreedom:
        freedom !== null &&
        d.getMonth() === freedom.getMonth() &&
        d.getFullYear() === freedom.getFullYear(),
      isPast: freedom !== null && d < freedom,
    };
  });

  const freedomIndex = months.findIndex((m) => m.isFreedom);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4"
      >
        {months.map((m, i) => (
          <motion.div
            key={m.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`relative flex shrink-0 flex-col items-center rounded-xl px-3 py-2 text-center transition-colors ${
              m.isFreedom
                ? "bg-green-500/20 ring-2 ring-green-500 text-green-400"
                : m.isToday
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : m.isPast
                    ? "bg-muted/50"
                    : "bg-muted/20"
            }`}
          >
            <span className="text-[10px] text-muted-foreground">{m.year}</span>
            <span
              className={`text-sm font-semibold ${
                m.isFreedom ? "text-green-400" : m.isToday ? "text-primary" : ""
              }`}
            >
              {m.month}
            </span>
            {m.isToday && (
              <span className="text-[9px] font-medium text-primary">NOW</span>
            )}
            {m.isFreedom && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-[9px] font-bold text-green-400"
              >
                FREE
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress line */}
      {freedomIndex > 0 && (
        <div className="mt-2 flex items-center gap-1 px-4">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/30">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-green-500"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((freedomIndex / months.length) * 100, 100)}%`,
              }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      {!freedom && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Keep optimizing to unlock your freedom date
        </p>
      )}
    </div>
  );
}
