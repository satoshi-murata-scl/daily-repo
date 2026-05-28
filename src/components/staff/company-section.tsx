import { Card } from "@/components/ui";
import { GuidelineSpotlightSection } from "@/components/staff/guideline-spotlight-section";
import { buildDailySeed } from "@/lib/daily-guideline";

function MvvBlock({
  label,
  text,
  emptyHint,
}: {
  label: string;
  text: string;
  emptyHint: string;
}) {
  return (
    <section className="rounded-xl border border-teal-100/80 bg-white/80 px-4 py-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-800">
        {label}
      </h3>
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
        {text || emptyHint}
      </p>
    </section>
  );
}

export function CompanySection({
  staffId,
  today,
  mission,
  vision,
  values,
  companyGuidelines,
}: {
  staffId: string;
  today: Date;
  mission: string;
  vision: string;
  values: string;
  companyGuidelines: { id: string; checkName: string }[];
}) {
  const items = companyGuidelines.map((c) => ({
    id: c.id,
    title: c.checkName,
  }));

  const allEmpty = !mission && !vision && !values;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        ① 会社の軸（読むだけ）
      </p>

      <Card className="border-teal-100 bg-gradient-to-br from-white to-teal-50/50">
        <p className="mb-3 text-sm font-semibold text-slate-900">
          会社のミッション・ビジョン・バリュー
        </p>
        {allEmpty ? (
          <p className="text-[15px] text-slate-500">（オーナーが未設定です）</p>
        ) : (
          <div className="space-y-3">
            <MvvBlock
              label="ミッション"
              text={mission}
              emptyHint="（未設定）"
            />
            <MvvBlock label="ビジョン" text={vision} emptyHint="（未設定）" />
            <MvvBlock label="バリュー" text={values} emptyHint="（未設定）" />
          </div>
        )}
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
