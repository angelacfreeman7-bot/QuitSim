export interface Benchmark {
  label: string;
  value: string;
  context: string;
}

interface BracketData {
  savingsMonthsAvg: number;
  savingsMonthsRange: [number, number];
  runwayRange: [number, number];
  aheadOfPercent: number;
}

function getBracket(salary: number): BracketData {
  if (salary < 50_000) {
    return {
      savingsMonthsAvg: 3.5,
      savingsMonthsRange: [3, 4],
      runwayRange: [4, 6],
      aheadOfPercent: 55,
    };
  }
  if (salary < 80_000) {
    return {
      savingsMonthsAvg: 5,
      savingsMonthsRange: [4, 6],
      runwayRange: [6, 10],
      aheadOfPercent: 50,
    };
  }
  if (salary < 120_000) {
    return {
      savingsMonthsAvg: 6.5,
      savingsMonthsRange: [5, 8],
      runwayRange: [8, 14],
      aheadOfPercent: 45,
    };
  }
  return {
    savingsMonthsAvg: 9,
    savingsMonthsRange: [6, 12],
    runwayRange: [10, 18],
    aheadOfPercent: 40,
  };
}

function positionWord(value: number, low: number, high: number): string {
  const mid = (low + high) / 2;
  if (value >= high) return 'above';
  if (value > mid) return 'above';
  if (value >= low) return 'on par with';
  return 'below';
}

export function getBenchmarks(
  salary: number,
  savings: number,
  monthlyExpenses: number,
  runwayMonths: number,
): Benchmark[] {
  const bracket = getBracket(salary);
  const savingsMonths =
    monthlyExpenses > 0 ? Math.round((savings / monthlyExpenses) * 10) / 10 : 0;

  const savingsPosition = positionWord(
    savingsMonths,
    bracket.savingsMonthsRange[0],
    bracket.savingsMonthsRange[1],
  );

  const runwayPosition = positionWord(
    runwayMonths,
    bracket.runwayRange[0],
    bracket.runwayRange[1],
  );

  // Estimate percentile based on position relative to bracket average
  let percentile = bracket.aheadOfPercent;
  if (savingsMonths > bracket.savingsMonthsAvg * 1.5) {
    percentile = Math.min(90, bracket.aheadOfPercent + 30);
  } else if (savingsMonths > bracket.savingsMonthsAvg) {
    percentile = bracket.aheadOfPercent + 15;
  } else if (savingsMonths < bracket.savingsMonthsAvg * 0.5) {
    percentile = Math.max(15, bracket.aheadOfPercent - 20);
  }

  return [
    {
      label: `Your savings could cover ${savingsMonths} months of bills`,
      value: `${savingsMonths}`,
      context:
        savingsPosition === 'on par with'
          ? `That's about average for people earning similar pay (${bracket.savingsMonthsRange[0]}–${bracket.savingsMonthsRange[1]} months is typical)`
          : `That's ${savingsPosition} average for people earning similar pay (${bracket.savingsMonthsRange[0]}–${bracket.savingsMonthsRange[1]} months is typical)`,
    },
    {
      label: `Your money could last ${runwayMonths} months — that's ${runwayPosition} others like you`,
      value: `${runwayMonths}`,
      context: `Most people in your range: ${bracket.runwayRange[0]}–${bracket.runwayRange[1]} months`,
    },
    {
      label: `You're in better shape than ${percentile}% of people`,
      value: `${percentile}%`,
      context:
        percentile >= 65
          ? "You're doing better than most — nice work!"
          : percentile >= 45
          ? "You're building a solid foundation"
          : 'Every bit you save puts you ahead of more people',
    },
  ];
}
