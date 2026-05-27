/** 個人行動指針の習慣レベル（累計チェック回数）の店舗別閾値 */

export type LevelThresholds = {
  level2: number;
  level3: number;
  level4: number;
  level5: number;
};

export const DEFAULT_LEVEL_THRESHOLDS: LevelThresholds = {
  level2: 8,
  level3: 18,
  level4: 30,
  level5: 50,
};

export type StoreLevelFields = {
  level2MinChecks: number;
  level3MinChecks: number;
  level4MinChecks: number;
  level5MinChecks: number;
};

export function thresholdsFromStore(store: StoreLevelFields): LevelThresholds {
  return {
    level2: store.level2MinChecks,
    level3: store.level3MinChecks,
    level4: store.level4MinChecks,
    level5: store.level5MinChecks,
  };
}

/** Lv2〜5 の累計回数が昇順か検証。問題ならエラーメッセージ */
export function validateLevelThresholds(t: LevelThresholds): string | null {
  const vals = [t.level2, t.level3, t.level4, t.level5];
  if (vals.some((n) => !Number.isFinite(n) || n < 1)) {
    return "Lv2〜5 は1回以上の整数で入力してください。";
  }
  for (let i = 1; i < vals.length; i++) {
    if (vals[i]! <= vals[i - 1]!) {
      return "Lv2 < Lv3 < Lv4 < Lv5 になるよう、回数を大きい順に並べてください。";
    }
  }
  if (vals[4]! > 9999) {
    return "回数は9999以下にしてください。";
  }
  return null;
}

export function parseLevelThresholdsFromForm(formData: FormData): LevelThresholds {
  return {
    level2: Number(formData.get("level2MinChecks") ?? DEFAULT_LEVEL_THRESHOLDS.level2),
    level3: Number(formData.get("level3MinChecks") ?? DEFAULT_LEVEL_THRESHOLDS.level3),
    level4: Number(formData.get("level4MinChecks") ?? DEFAULT_LEVEL_THRESHOLDS.level4),
    level5: Number(formData.get("level5MinChecks") ?? DEFAULT_LEVEL_THRESHOLDS.level5),
  };
}

/** 累計チェック数から行動指針レベル（1〜5）を算出 */
export function levelFromTotalChecks(
  total: number,
  thresholds: LevelThresholds = DEFAULT_LEVEL_THRESHOLDS,
): number {
  if (total >= thresholds.level5) return 5;
  if (total >= thresholds.level4) return 4;
  if (total >= thresholds.level3) return 3;
  if (total >= thresholds.level2) return 2;
  return 1;
}

/** スタッフ設定画面など用の表示行 */
export function formatLevelThresholdGuide(thresholds: LevelThresholds): string {
  const t = thresholds;
  return [
    `Lv1: 0〜${t.level2 - 1}回`,
    `Lv2: ${t.level2}回〜`,
    `Lv3: ${t.level3}回〜`,
    `Lv4: ${t.level4}回〜`,
    `Lv5: ${t.level5}回〜`,
  ].join(" / ");
}

/** @deprecated 互換用 */
export const LEVEL_THRESHOLDS = [
  { level: 2, checks: DEFAULT_LEVEL_THRESHOLDS.level2 },
  { level: 3, checks: DEFAULT_LEVEL_THRESHOLDS.level3 },
  { level: 4, checks: DEFAULT_LEVEL_THRESHOLDS.level4 },
  { level: 5, checks: DEFAULT_LEVEL_THRESHOLDS.level5 },
] as const;
