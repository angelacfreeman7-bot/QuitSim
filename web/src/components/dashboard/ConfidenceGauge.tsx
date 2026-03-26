"use client";

import { motion } from "framer-motion";

interface ConfidenceGaugeProps {
  value: number; // 0-100
}

export function ConfidenceGauge({ value }: ConfidenceGaugeProps) {
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (value / 100) * circumference * 0.75; // 270 degree arc
  const rotation = -225; // Start from bottom-left

  const getColor = (v: number) => {
    if (v >= 70) return "text-green-500";
    if (v >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getLabel = (v: number) => {
    if (v >= 80) return "Ready to quit";
    if (v >= 60) return "Getting there";
    if (v >= 40) return "Needs work";
    return "Not yet";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="180" viewBox="0 0 200 180">
        {/* Background arc */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className="text-muted/30"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          transform={`rotate(${rotation} 100 100)`}
        />
        {/* Value arc */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          className={getColor(value)}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          transform={`rotate(${rotation} 100 100)`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <motion.span
          className={`text-5xl font-bold tabular-nums ${getColor(value)}`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value}%
        </motion.span>
        <span className="text-sm text-muted-foreground mt-1">Quit Confidence</span>
        <span className={`text-xs font-medium mt-1 ${getColor(value)}`}>
          {getLabel(value)}
        </span>
      </div>
    </div>
  );
}
