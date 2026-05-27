import { Card, CardTitle } from "@/components/ui";
import { GuidelineSpotlightSection } from "@/components/staff/guideline-spotlight-section";
import { buildDailySeed } from "@/lib/daily-guideline";

export function CompanySection({
  staffId,
  today,
  statementTitle,
  statement,
  companyGuidelines,
}: {
  staffId: string;
  today: Date;
  statementTitle: string;
  statement: string;
  companyGuidelines: { id: string; checkName: string }[];
}) {
  const items = companyGuidelines.map((c) => ({
    id: c.id,
    title: c.checkName,
  }));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        ① 会社の軸（読むだけ）
      </p>

      <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/50">
        <CardTitle>{statementTitle || "店舗ステートメント"}</CardTitle>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
          {statement || "（オーナーが未設定です）"}
        </p>
      </Card>

      <GuidelineSpotlightSection
        title="会社の行動指針"
        subtitle="全スタッフ共通・チェック不要"
        spotlightSubtitle="今日のひとつ"
        items={items}
        seedKey={buildDailySeed(staffId, today, "company")}
        emptyMessage="オーナーが未登録です。"
        collapseLabel={(n) => `ほか ${n} 件の会社の行動指針を見る`}
      />
    </div>
  );
}
