import type { JobTitle } from "@/generated/prisma/client";

export const JOB_TITLE_OPTIONS: { value: JobTitle; label: string }[] = [
  { value: "STYLIST", label: "スタイリスト" },
  { value: "ASSISTANT", label: "アシスタント" },
];

const JOB_TITLE_LABELS: Record<JobTitle, string> = {
  STYLIST: "スタイリスト",
  ASSISTANT: "アシスタント",
  OTHER: "その他",
};

export function jobTitleLabel(jobTitle: JobTitle): string {
  return JOB_TITLE_LABELS[jobTitle] ?? jobTitle;
}

const TAB_TO_JOB: Record<string, JobTitle> = {
  stylist: "STYLIST",
  assistant: "ASSISTANT",
};

export function parseJobTitleTab(tab?: string | null): JobTitle | null {
  if (!tab) return null;
  return TAB_TO_JOB[tab] ?? null;
}

export function jobTitleToTab(jobTitle: JobTitle): string {
  const entry = Object.entries(TAB_TO_JOB).find(([, v]) => v === jobTitle);
  return entry?.[0] ?? "stylist";
}

const JOB_TITLE_VALUES = new Set<string>(JOB_TITLE_OPTIONS.map((o) => o.value));

export function parseJobTitleValue(value: string | null | undefined): JobTitle {
  const v = String(value ?? "STYLIST").toUpperCase();
  if (JOB_TITLE_VALUES.has(v)) return v as JobTitle;
  return "STYLIST";
}
