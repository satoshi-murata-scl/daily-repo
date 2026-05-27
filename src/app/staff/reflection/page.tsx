import { MonthSelector } from "@/components/owner/month-selector";
import { StaffPageHeader } from "@/components/staff/staff-page-header";
import { DailySaveHabitNotice } from "@/components/staff/daily-save-habit-notice";
import { Card, CardTitle, ProgressBar, LevelBadge } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { formatDateJa, formatMonthJa } from "@/lib/dates";
import { parseMonthParam, staffReflectionMonthNavUrls } from "@/lib/month";
import { getMonthlyReflection } from "@/lib/reflection";
import { isSameMonth, startOfMonth } from "date-fns";

export default async function StaffReflectionPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await requireStaff();
  const { month: monthStr } = await searchParams;
  const month = parseMonthParam(monthStr);
  const nav = staffReflectionMonthNavUrls(month);
  const isCurrentMonth = isSameMonth(month, startOfMonth(new Date()));

  const data = await getMonthlyReflection(session.id, month);

  if (!data) return null;

  const monthLabel = formatMonthJa(month);

  return (
    <>
      <StaffPageHeader
        title="振り返り"
        subtitle={isCurrentMonth ? `${monthLabel}（今月）` : monthLabel}
        backHref="/staff"
        backLabel="メインに戻る"
      />

      <div className="mt-3 space-y-3 sm:space-y-4">
        <MonthSelector
          month={month}
          prevHref={nav.prev}
          nextHref={nav.next}
          nextDisabled={!nav.hasNext}
        />

        <p className="text-center text-xs text-slate-500">
          {monthLabel}の記録を表示しています
        </p>

        <Card className="border-teal-100 bg-teal-50/30">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">デイレポ記録</p>
              <p className="text-3xl font-bold tabular-nums text-teal-800">
                {data.recordCount}
                <span className="ml-1 text-base font-medium text-slate-600">日</span>
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                入力率 {data.inputRate}%（{data.daysInMonth}日中）
              </p>
              <p className="mt-2">
                <DailySaveHabitNotice variant="compact" />
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">完了タスク</p>
              <p className="text-3xl font-bold tabular-nums text-teal-800">
                {data.tasksDone}
                <span className="ml-1 text-base font-medium text-slate-600">件</span>
              </p>
            </div>
          </div>
        </Card>

        {data.guidelineStats.length > 0 && (
          <Card>
            <CardTitle sub={`${monthLabel}の達成日数`}>行動指針の達成</CardTitle>
            <div className="space-y-4">
              {data.guidelineStats.map((item) => (
                <div key={item.id}>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-medium leading-snug text-slate-800">
                      {item.title}
                      {!item.isActive && (
                        <span className="text-xs text-slate-400">（削除済）</span>
                      )}
                    </p>
                    <LevelBadge level={item.level} />
                  </div>
                  <ProgressBar value={item.count} max={data.recordCount || 1} />
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {monthLabel} {item.count}日達成 ／ 累計チェック {item.totalChecks}回
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <CardTitle sub={`${monthLabel}に保存した一言`}>今日の一言</CardTitle>
          {data.comments.length === 0 ? (
            <p className="text-sm text-slate-500">
              {monthLabel}はまだ入力がありません。
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.comments.map((item, i) => (
                <li key={i} className="py-3.5 first:pt-0 last:pb-0">
                  <time
                    dateTime={item.date.toISOString()}
                    className="text-xs font-medium text-slate-500"
                  >
                    {formatDateJa(item.date)}
                  </time>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-800">
                    {item.comment}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {data.history.length > 0 && (
          <Card>
            <CardTitle sub={`${monthLabel}の変化`}>レベルアップ履歴</CardTitle>
            <ul className="space-y-2 text-sm">
              {data.history.map((h) => (
                <li key={h.id} className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
                  行動指針: Lv{h.oldLevel} → Lv{h.newLevel}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
