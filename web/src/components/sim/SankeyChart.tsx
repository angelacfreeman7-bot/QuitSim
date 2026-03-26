"use client";

import { motion } from "framer-motion";
import { SimResult } from "@/types";

interface SankeyChartProps {
  result: SimResult;
  monthlyExpenses: number;
}

interface FlowNode {
  label: string;
  value: number;
  color: string;
}

const formatK = (v: number) => {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v}`;
};

export function SankeyChart({ result, monthlyExpenses }: SankeyChartProps) {
  const month1 = result.months[0];
  if (!month1) return null;

  const totalIncome = month1.income;
  const totalExpenses = month1.expenses;
  const netSavings = Math.max(0, totalIncome - totalExpenses);
  const deficit = Math.max(0, totalExpenses - totalIncome);

  // Income sources
  const incomeNodes: FlowNode[] = [
    { label: "Job / Side Income", value: totalIncome, color: "hsl(150, 60%, 50%)" },
  ];

  // Expense breakdown (estimated splits)
  const housing = monthlyExpenses * 0.35;
  const food = monthlyExpenses * 0.15;
  const transport = monthlyExpenses * 0.1;
  const utilities = monthlyExpenses * 0.08;
  const other = monthlyExpenses * 0.32;

  const expenseNodes: FlowNode[] = [
    { label: "Housing", value: housing, color: "hsl(0, 70%, 60%)" },
    { label: "Food", value: food, color: "hsl(30, 70%, 55%)" },
    { label: "Transport", value: transport, color: "hsl(45, 70%, 55%)" },
    { label: "Utilities", value: utilities, color: "hsl(200, 60%, 55%)" },
    { label: "Other", value: other, color: "hsl(270, 50%, 55%)" },
  ];

  if (netSavings > 0) {
    expenseNodes.push({
      label: "Savings",
      value: netSavings,
      color: "hsl(150, 60%, 50%)",
    });
  }

  const maxValue = Math.max(totalIncome, totalExpenses + netSavings);
  const barHeight = 200;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Monthly Cash Flow</span>
        {deficit > 0 && (
          <span className="text-xs text-red-400">
            -{formatK(deficit)}/mo deficit
          </span>
        )}
      </div>

      <div className="relative flex items-stretch gap-4" style={{ height: barHeight }}>
        {/* Income side */}
        <div className="flex flex-1 flex-col items-end gap-1">
          <span className="text-[10px] font-medium text-muted-foreground mb-1">
            INCOME
          </span>
          {incomeNodes.map((node, i) => {
            const height = Math.max(
              (node.value / maxValue) * (barHeight - 30),
              20
            );
            return (
              <motion.div
                key={node.label}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex items-center justify-end rounded-l-lg px-2"
                style={{
                  height,
                  backgroundColor: `${node.color}20`,
                  borderRight: `3px solid ${node.color}`,
                }}
              >
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground truncate">
                    {node.label}
                  </p>
                  <p className="text-xs font-bold" style={{ color: node.color }}>
                    {formatK(node.value)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center connector */}
        <div className="flex w-8 flex-col items-center justify-center">
          <svg width="32" height={barHeight} className="overflow-visible">
            {expenseNodes.map((node, i) => {
              const yPos = (i / expenseNodes.length) * barHeight;
              return (
                <motion.path
                  key={node.label}
                  d={`M 0,${barHeight / 2} C 16,${barHeight / 2} 16,${yPos + 10} 32,${yPos + 10}`}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={Math.max(1, (node.value / maxValue) * 8)}
                  strokeOpacity={0.4}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                />
              );
            })}
          </svg>
        </div>

        {/* Expense side */}
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-[10px] font-medium text-muted-foreground mb-1">
            EXPENSES
          </span>
          {expenseNodes.map((node, i) => {
            const height = Math.max(
              (node.value / maxValue) * (barHeight - 30),
              16
            );
            return (
              <motion.div
                key={node.label}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="relative flex items-center rounded-r-lg px-2"
                style={{
                  height,
                  backgroundColor: `${node.color}20`,
                  borderLeft: `3px solid ${node.color}`,
                }}
              >
                <div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {node.label}
                  </p>
                  <p className="text-xs font-bold" style={{ color: node.color }}>
                    {formatK(node.value)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span>
          Monthly in:{" "}
          <strong className="text-green-400">{formatK(totalIncome)}</strong>
        </span>
        <span>
          Monthly out:{" "}
          <strong className="text-red-400">{formatK(totalExpenses)}</strong>
        </span>
      </div>
    </div>
  );
}
