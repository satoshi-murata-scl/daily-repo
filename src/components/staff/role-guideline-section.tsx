import { GuidelineSpotlightSection } from "@/components/staff/guideline-spotlight-section";
import { buildDailySeed } from "@/lib/daily-guideline";
import { jobTitleLabel } from "@/lib/job-title";
import type { JobTitle } from "@/generated/prisma/client";

export function RoleGuidelineSection({
  staffId,
  today,
  jobTitle,
  roleGuidelines,
}: {
  staffId: string;
  today: Date;
  jobTitle: JobTitle;
  roleGuidelines: { id: string; title: string }[];
}) {
  const label = jobTitleLabel(jobTitle);

  return (
    <GuidelineSpotlightSection
      title={`役職別の行動指針（${label}）`}
      subtitle="今日のひとつ — 読んで意識する（チェック不要）"
      spotlightSubtitle="今日のひとつ"
      items={roleGuidelines}
      seedKey={buildDailySeed(staffId, today, "role")}
      emptyMessage={`${label}向けの指針はまだ登録されていません。`}
      collapseLabel={(n) => `ほか ${n} 件の役職別指針を見る`}
    />
  );
}
