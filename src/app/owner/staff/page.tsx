import Link from "next/link";
import { FlashCookieClear } from "@/components/flash-cookie-clear";
import { AppShell } from "@/components/layout";
import { DeleteStaffButton } from "@/components/owner/delete-staff-button";
import { MonthSelector } from "@/components/owner/month-selector";
import { Button, Card, CardTitle, Input } from "@/components/ui";
import { JobTitleSelect } from "@/components/job-title-select";
import {
  createStaffAction,
  resetStaffPasswordByOwnerAction,
  updateStaffEmailAction,
} from "@/lib/actions/owner";
import { jobTitleLabel } from "@/lib/job-title";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMonthJa } from "@/lib/dates";
import { parseMonthParam, staffListMonthNavUrls } from "@/lib/month";
import { getStaffListSummaries } from "@/lib/reflection";
import { readStaffCreatedFlash } from "@/lib/staff-created-flash";
import { getStoreStaffQuota } from "@/lib/staff-quota";

const ownerNav = [
  { href: "/owner", label: "店舗設定" },
  { href: "/owner/checks", label: "行動指針" },
  { href: "/owner/staff", label: "スタッフ管理" },
];

export default async function OwnerStaffPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    deleted?: string;
    created?: string;
    account_saved?: string;
    password_reset?: string;
    error?: string;
  }>;
}) {
  const session = await requireOwner();
  const { month: monthStr, deleted, account_saved, password_reset, error } =
    await searchParams;
  const month = parseMonthParam(monthStr);
  const nav = staffListMonthNavUrls(month);

  const [summaries, quota, createdFlash, staffAccounts] = await Promise.all([
    getStaffListSummaries(session.storeId, month),
    getStoreStaffQuota(session.storeId),
    readStaffCreatedFlash(),
    prisma.staff.findMany({
      where: { storeId: session.storeId, role: "STAFF" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, jobTitle: true },
    }),
  ]);

  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    select: { storeCode: true },
  });

  const canAdd = quota?.canAdd ?? false;

  return (
    <AppShell
      title="スタッフ管理"
      subtitle={`${formatMonthJa(month)}の面談ダッシュボード`}
      nav={ownerNav}
    >
      <FlashCookieClear active={Boolean(createdFlash)} />
      {deleted && (
        <p className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-900">
          スタッフを削除しました。
        </p>
      )}

      {account_saved && (
        <p className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-900">
          メールアドレスを保存しました。
        </p>
      )}

      {createdFlash && (
        <Card className="border-amber-200 bg-amber-50">
          <CardTitle>
            {password_reset ? "パスワードを再設定しました" : "スタッフを追加しました"}
          </CardTitle>
          <p className="text-sm text-slate-800">
            <strong>{createdFlash.name}</strong>（{createdFlash.email}）
          </p>
          <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-sm">
            初期パスワード: <strong>{createdFlash.password}</strong>
          </p>
          <p className="mt-2 text-xs text-amber-900">
            この画面を閉じると再表示できません。スタッフへ安全な経路で共有してください。
          </p>
        </Card>
      )}

      {error === "quota" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          スタッフ上限に達しています。枠の増設はサポートへご連絡ください。
        </p>
      )}
      {error === "exists" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          このメールアドレスは既に登録されています。
        </p>
      )}
      {error === "invalid" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          入力内容を確認してください（パスワードは6文字以上）。
        </p>
      )}
      {error === "staff" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          対象のスタッフが見つかりません。
        </p>
      )}

      <Card className="border-slate-200 bg-slate-50/80">
        <CardTitle>スタッフ枠</CardTitle>
        <p className="text-sm text-slate-700">
          登録 <strong>{quota?.current ?? 0}</strong> 名 / 上限{" "}
          <strong>{quota?.maxStaff ?? "—"}</strong> 名
          {canAdd && (
            <span className="ml-2 text-teal-700">（あと {quota?.remaining} 名追加可能）</span>
          )}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          上限まではオーナーがスタッフを追加できます。退職・異動で不要になったアカウントは削除してください。
          {store?.storeCode && (
            <>
              {" "}
              枠の増設: 店舗コード{" "}
              <code className="rounded bg-white px-1">{store.storeCode}</code>
            </>
          )}
        </p>
      </Card>

      <Card>
        <CardTitle sub="パスワードは再設定後のみ一度表示されます（保存済みのパスワードは確認できません）">
          スタッフのログイン情報
        </CardTitle>
        {staffAccounts.length === 0 ? (
          <p className="text-sm text-slate-500">スタッフがまだ登録されていません。</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {staffAccounts.map((s) => (
              <li key={s.id} className="space-y-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{jobTitleLabel(s.jobTitle)}</p>
                </div>
                <form action={updateStaffEmailAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="staffId" value={s.id} />
                  <input type="hidden" name="month" value={nav.param} />
                  <Input
                    label="メールアドレス"
                    name="email"
                    type="email"
                    required
                    defaultValue={s.email}
                    className="min-w-[220px] flex-1"
                  />
                  <Button type="submit" variant="secondary">
                    メールを保存
                  </Button>
                </form>
                <form
                  action={resetStaffPasswordByOwnerAction}
                  className="flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="staffId" value={s.id} />
                  <input type="hidden" name="month" value={nav.param} />
                  <Input
                    label="新しいパスワード（6文字以上）"
                    name="password"
                    type="password"
                    minLength={6}
                    required
                    placeholder="再設定するパスワード"
                    className="min-w-[220px] flex-1"
                  />
                  <Button type="submit" variant="secondary">
                    パスワードを再設定
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {canAdd && (
        <Card>
          <CardTitle sub="初期パスワードは追加直後のみ表示されます">スタッフを追加</CardTitle>
          <form action={createStaffAction} className="space-y-3">
            <Input label="名前" name="name" required />
            <Input label="メールアドレス" name="email" type="email" required />
            <Input
              label="初期パスワード"
              name="password"
              type="password"
              minLength={6}
              required
              placeholder="6文字以上（スタッフへ共有）"
            />
            <JobTitleSelect />
            <Button type="submit" className="w-full">
              スタッフを追加
            </Button>
          </form>
        </Card>
      )}

      <MonthSelector
        month={month}
        prevHref={nav.prev}
        nextHref={nav.next}
      />

      <div className="flex justify-end">
        <Link
          href={`/owner/staff/export?month=${nav.param}`}
          className="text-sm text-teal-700 underline"
        >
          CSVエクスポート
        </Link>
      </div>

      <Card>
        <CardTitle>スタッフ一覧（今月）</CardTitle>
        <ul className="divide-y divide-slate-100">
          {summaries.map((s) => (
            <li
              key={s.staffId}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">
                  {s.email} · {jobTitleLabel(s.jobTitle)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  記録 <span className="font-semibold">{s.recordCount}日</span>
                  <span className="mx-2 text-slate-300">|</span>
                  入力率 <span className="font-semibold">{s.inputRate}%</span>
                </p>
                {s.guidelines.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {s.guidelines.map((g, i) => (
                      <li
                        key={i}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {g.title.slice(0, 12)}
                        {g.title.length > 12 ? "…" : ""}{" "}
                        <span className="font-medium text-teal-800">{g.count}日</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-stretch gap-2 sm:items-center">
                <Link
                  href={`/owner/staff/${s.staffId}?month=${nav.param}`}
                  className="inline-flex"
                >
                  <Button variant="primary" className="min-w-[5.5rem] shadow-sm">
                    詳細
                  </Button>
                </Link>
                <DeleteStaffButton staffId={s.staffId} staffName={s.name} />
              </div>
            </li>
          ))}
        </ul>
        {summaries.length === 0 && (
          <p className="text-sm text-slate-500">
            スタッフがまだ登録されていません。上のフォームから追加できます。
          </p>
        )}
      </Card>
    </AppShell>
  );
}
