import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout";
import { prisma } from "@/lib/db";
import { MonthSelector } from "@/components/owner/month-selector";
import {
  Button,
  Card,
  CardTitle,
  Input,
  LevelBadge,
  ProgressBar,
  Textarea,
} from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import {
  assignGuidelineToStaffAction,
  saveMeetingNoteAction,
  updateGuidelineEvaluationAction,
} from "@/lib/actions/owner";
import { formatDateJa, formatDateTimeJa, formatMonthJa } from "@/lib/dates";
import { MAX_ACTION_GUIDELINES } from "@/lib/guideline-limits";
import { LEVEL_LABELS } from "@/lib/levels";
import { monthNavUrls, parseMonthParam } from "@/lib/month";
import { getMonthlyReflection } from "@/lib/reflection";

const ownerNav = [
  { href: "/owner", label: "店舗設定" },
  { href: "/owner/checks", label: "会社の行動指針" },
  { href: "/owner/staff", label: "スタッフ管理" },
];

export default async function OwnerStaffDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; saved?: string; error?: string }>;
}) {
  const session = await requireOwner();
  const { id } = await params;
  const { month: monthStr, saved, error } = await searchParams;
  const month = parseMonthParam(monthStr);
  const nav = monthNavUrls(id, month);

  const staff = await prisma.staff.findFirst({
    where: { id, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) notFound();

  const data = await getMonthlyReflection(id, month);
  if (!data) notFound();

  const { insights, activeGuidelines } = data;

  return (
    <AppShell
      title={staff.name}
      subtitle={`${formatMonthJa(month)}の面談・振り返り`}
      nav={ownerNav}
    >
      {saved && (
        <p className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-900">
          保存しました。
        </p>
      )}

      {error === "guideline_limit" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          行動指針は最大{MAX_ACTION_GUIDELINES}件です。不要な項目をスタッフ設定から削除してから追加してください。
        </p>
      )}
      {error === "guideline_empty" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          行動指針の内容を入力してください。
        </p>
      )}

      <Card className="border-indigo-100 bg-indigo-50/30">
        <CardTitle sub="② このスタッフのデイレポ「個人の行動指針」に追加されます">
          行動指針を付与
        </CardTitle>
        <form action={assignGuidelineToStaffAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="staffId" value={id} />
          <input type="hidden" name="month" value={nav.param} />
          <Input
            label="指針の内容"
            name="title"
            required
            placeholder="例：報告は結論ファーストで行う"
            className="min-w-[200px] flex-1"
          />
          <Button type="submit">追加</Button>
        </form>
      </Card>

      <p className="text-sm leading-relaxed text-slate-600">
        月末面談用のサマリーです。TOP3・抜けやすい行動は自動集計しています。
      </p>

      <MonthSelector
        month={month}
        prevHref={nav.prev}
        nextHref={nav.next}
        listHref={`/owner/staff?month=${nav.param}`}
      />

      <Card className="border-teal-100 bg-teal-50/40">
        <CardTitle>今月の入力状況</CardTitle>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-teal-800">{data.recordCount}</p>
            <p className="text-xs text-slate-600">記録日数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{data.daysInMonth}</p>
            <p className="text-xs text-slate-600">対象月の日数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{data.inputRate}%</p>
            <p className="text-xs text-slate-600">入力率</p>
          </div>
        </div>
      </Card>

      {activeGuidelines.length > 0 ? (
        <Card>
          <CardTitle>行動指針（今月）</CardTitle>
          <div className="space-y-4">
            {activeGuidelines.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="text-xs text-slate-500">
                    習慣 <LevelBadge level={item.level} />
                  </span>
                  {item.ownerEvaluationLevel != null && (
                    <span className="text-xs text-indigo-700">
                      評価 <LevelBadge level={item.ownerEvaluationLevel} />
                    </span>
                  )}
                </div>
                <ProgressBar value={item.count} max={data.recordCount || 1} />
                <p className="mt-1 text-xs text-slate-500">
                  今月 {item.count}日 ／ 累計 {item.totalChecks}回
                </p>
                <form
                  action={updateGuidelineEvaluationAction}
                  className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-200/80 pt-3"
                >
                  <input type="hidden" name="guidelineId" value={item.id} />
                  <input type="hidden" name="month" value={nav.param} />
                  <label className="text-xs text-slate-600">
                    質の評価 Lv
                    <select
                      name="evaluationLevel"
                      defaultValue={item.ownerEvaluationLevel ?? item.level}
                      className="ml-1 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((lv) => (
                        <option key={lv} value={lv}>
                          Lv{lv} {LEVEL_LABELS[lv]?.split(" — ")[0]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button type="submit" variant="secondary" className="text-xs">
                    評価を記録
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <CardTitle>行動指針（今月）</CardTitle>
          <p className="text-sm text-slate-500">有効な行動指針がありません。</p>
        </Card>
      )}

      {activeGuidelines.length > 0 ? (
        <>
          {insights.top3.length > 0 && (
            <Card>
              <CardTitle sub="面談 Step1：本人に言ってもらう">できた TOP3（自動）</CardTitle>
              <ol className="list-decimal space-y-2 pl-5">
                {insights.top3.map((g) => (
                  <li key={g.id} className="text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="ml-2 text-slate-500">（{g.count}日達成）</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
          {insights.weak1 && (
            <Card className="border-amber-100 bg-amber-50/30">
              <CardTitle sub="面談 Step2：原因を一緒に探す">
                抜けやすい行動 TOP1（自動）
              </CardTitle>
              <p className="text-sm font-medium text-slate-900">{insights.weak1.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                今月 {insights.weak1.count}日 / 記録{data.recordCount}日中
              </p>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardTitle>面談用インサイト</CardTitle>
          <p className="text-sm text-slate-500">
            行動指針が登録されると、できた TOP3 と抜けやすい行動を自動表示します。
          </p>
        </Card>
      )}

      <Card>
        <CardTitle>今日の一言（今月）</CardTitle>
        {data.comments.length === 0 ? (
          <p className="text-sm text-slate-500">入力なし</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.comments.map((c, i) => (
              <li key={i} className="py-2 text-sm">
                <span className="text-slate-500">{formatDateJa(c.date)}</span>
                <p className="mt-0.5">{c.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>個人ステートメント</CardTitle>
        {staff.personalMission && (
          <p className="mb-2 text-sm">
            <span className="font-medium">ミッション:</span> {staff.personalMission}
          </p>
        )}
        {staff.vision30Days && (
          <p className="mb-2 text-sm">
            <span className="font-medium">30日ビジョン:</span> {staff.vision30Days}
          </p>
        )}
        {staff.personalValues && (
          <p className="text-sm">
            <span className="font-medium">バリュー:</span> {staff.personalValues}
          </p>
        )}
        {!staff.personalMission && !staff.vision30Days && !staff.personalValues && (
          <p className="text-sm text-slate-500">未設定</p>
        )}
      </Card>

      {data.history.length > 0 && (
        <Card>
          <CardTitle>レベルアップ履歴（今月）</CardTitle>
          <ul className="space-y-2 text-sm">
            {data.history.map((h) => (
              <li key={h.id} className="rounded-lg bg-slate-50 px-3 py-2">
                目標{h.goalNo}: Lv{h.oldLevel} → Lv{h.newLevel}
                <span className="ml-2 text-xs text-slate-500">
                  {formatDateTimeJa(h.changedAt)}（{h.changedBy}）
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="bg-slate-50">
        <p className="text-center text-sm text-slate-700">
          サマリー：記録 <strong>{data.recordCount}</strong>日 ／ 一言{" "}
          <strong>{data.comments.length}</strong>件
        </p>
      </Card>

      <Card>
        <CardTitle sub="面談 Step3：来月の改善を1つ">面談メモ</CardTitle>
        <form action={saveMeetingNoteAction} className="space-y-3">
          <input type="hidden" name="staffId" value={id} />
          <input type="hidden" name="month" value={nav.param} />
          <Textarea
            label="面談メモ"
            name="note"
            rows={4}
            defaultValue={data.meetingNote?.note ?? ""}
            placeholder="面談で話したこと・気づき"
          />
          <Input
            label="来月の改善（1つだけ）"
            name="nextAction"
            defaultValue={data.meetingNote?.nextAction ?? ""}
            placeholder="例：報告を結論ファーストで行う習慣を続ける"
          />
          <Button type="submit" className="w-full">
            面談メモを保存
          </Button>
        </form>
      </Card>

      <p className="text-center">
        <Link href={`/owner/staff?month=${nav.param}`} className="text-sm text-teal-700 underline">
          ← スタッフ一覧に戻る
        </Link>
      </p>
    </AppShell>
  );
}
