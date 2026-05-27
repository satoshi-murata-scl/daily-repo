import { format } from "date-fns";

export type SpotlightItem = { id: string; title: string };

/** 日付＋スタッフ＋種別で毎日同じ1件を選ぶ（DB不要） */
export function pickDailyIndex(items: SpotlightItem[], seed: string): number {
  if (items.length === 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % items.length;
}

export function formatDateSeed(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function buildDailySeed(
  staffId: string,
  date: Date,
  kind: "company" | "role",
): string {
  return `${staffId}:${formatDateSeed(date)}:${kind}`;
}

export function splitSpotlight(
  items: SpotlightItem[],
  seed: string,
): { today: SpotlightItem | null; others: SpotlightItem[] } {
  if (items.length === 0) {
    return { today: null, others: [] };
  }
  const index = pickDailyIndex(items, seed);
  const today = items[index]!;
  const others = items.filter((_, i) => i !== index);
  return { today, others };
}
