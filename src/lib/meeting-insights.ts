export type GuidelineStat = {
  id: string;
  title: string;
  count: number;
  level: number;
  totalChecks: number;
  isActive: boolean;
  ownerEvaluationLevel?: number | null;
};

export function computeMeetingInsights(activeGuidelines: GuidelineStat[]) {
  const active = activeGuidelines.filter((g) => g.isActive);

  if (active.length === 0) {
    return { top3: [] as GuidelineStat[], weak1: null as GuidelineStat | null };
  }

  const sorted = [...active].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.totalChecks - a.totalChecks;
  });

  const top3 = sorted.slice(0, 3);

  const weakSorted = [...active].sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count;
    return a.totalChecks - b.totalChecks;
  });
  const weak1 = weakSorted[0] ?? null;

  return { top3, weak1 };
}

export function inputRatePercent(recordCount: number, daysInMonth: number): number {
  if (daysInMonth <= 0) return 0;
  return Math.round((recordCount / daysInMonth) * 1000) / 10;
}
