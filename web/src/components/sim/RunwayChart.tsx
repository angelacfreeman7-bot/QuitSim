"use client";

import { MonthData, MonteCarloResult } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

interface RunwayChartProps {
  data: MonthData[];
  mode: "line" | "area";
  monteCarlo?: MonteCarloResult;
}

const formatK = (v: number) => {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v}`;
};

/**
 * Build P10/median/P90 net-worth bands from Monte Carlo runs.
 *
 * Each MC run is a single runway number (months until broke).
 * We approximate net-worth curves by scaling the deterministic path:
 *   - P10 run lasts `p10` months → scale factor = p10 / deterministicRunway
 *   - P90 run lasts `p90` months → scale factor = p90 / deterministicRunway
 *
 * For each month we interpolate the deterministic net-worth by that scale
 * to show optimistic/pessimistic envelopes.
 */
function buildMCBands(
  months: MonthData[],
  mc: MonteCarloResult
): { month: string; p10: number; median: number; p90: number }[] {
  const detRunway = months.findIndex((m) => m.totalNetWorth <= 0);
  const effectiveRunway = detRunway === -1 ? months.length : detRunway;
  if (effectiveRunway === 0) return [];

  return months.map((m) => {
    const t = m.month;
    const nw = m.totalNetWorth;
    const startNW = months[0].totalNetWorth + (months[0].expenses - months[0].netCashflow);

    // Scale net worth decline by MC percentile ratios
    const p10Scale = effectiveRunway > 0 ? mc.p10 / effectiveRunway : 1;
    const p90Scale = effectiveRunway > 0 ? mc.p90 / effectiveRunway : 1;
    const medScale = effectiveRunway > 0 ? mc.median / effectiveRunway : 1;

    const decline = startNW - nw;
    return {
      month: `M${t}`,
      p10: Math.round(startNW - decline / Math.max(p10Scale, 0.1)),
      median: Math.round(startNW - decline / Math.max(medScale, 0.1)),
      p90: Math.round(startNW - decline / Math.max(p90Scale, 0.1)),
    };
  });
}

export function RunwayChart({ data, mode, monteCarlo }: RunwayChartProps) {
  const chartData = data.map((d, i) => {
    const base: Record<string, string | number> = {
      month: `M${d.month}`,
      "Net Worth": d.totalNetWorth,
      Savings: d.savings,
      Investments: d.investmentValue,
    };

    // Merge MC bands if available
    if (monteCarlo) {
      const bands = buildMCBands(data, monteCarlo);
      if (bands[i]) {
        base["P10 (worst)"] = bands[i].p10;
        base["P90 (best)"] = bands[i].p90;
      }
    }

    return base;
  });

  if (mode === "area") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(150, 60%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(150, 60%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(250, 60%, 60%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(250, 60%, 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mcBandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(40, 80%, 55%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
          <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tickFormatter={formatK} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value) => formatK(Number(value))}
          />
          {monteCarlo && (
            <>
              <Area type="monotone" dataKey="P90 (best)" stroke="none" fill="url(#mcBandGrad)" />
              <Area type="monotone" dataKey="P10 (worst)" stroke="none" fill="url(#mcBandGrad)" />
            </>
          )}
          <Area type="monotone" dataKey="Savings" stroke="hsl(150, 60%, 50%)" fill="url(#savingsGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="Investments" stroke="hsl(250, 60%, 60%)" fill="url(#investGrad)" strokeWidth={2} />
          <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
        <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis tickFormatter={formatK} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value) => formatK(Number(value))}
        />
        {monteCarlo && (
          <>
            <Line type="monotone" dataKey="P90 (best)" stroke="hsl(150, 50%, 50%)" strokeWidth={1} dot={false} strokeDasharray="2 4" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="P10 (worst)" stroke="hsl(0, 60%, 55%)" strokeWidth={1} dot={false} strokeDasharray="2 4" strokeOpacity={0.5} />
          </>
        )}
        <Line type="monotone" dataKey="Net Worth" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="Savings" stroke="hsl(150, 60%, 50%)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
        <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}
