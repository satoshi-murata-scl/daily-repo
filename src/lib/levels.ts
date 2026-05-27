export const LEVEL_LABELS: Record<number, string> = {
  1: "受動 — 言われたらやる",
  2: "実行 — 言われたことは確実にやる",
  3: "自発 — 自分からやる",
  4: "先読み — 周りを見て動く",
  5: "影響 — 周りに良い影響を与える",
};

export function levelBadge(level: number) {
  return `Lv${level}`;
}

/** 「受動」「実行」などレベル名の短い表記 */
export function levelShortName(level: number): string {
  return LEVEL_LABELS[level]?.split(" — ")[0] ?? "";
}
