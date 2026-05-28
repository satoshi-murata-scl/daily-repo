import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Button, Card, CardTitle, Textarea, Input } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  saveLevelThresholdsAction,
  updateStoreAction,
} from "@/lib/actions/owner";
import { thresholdsFromStore } from "@/lib/guideline-level";
import { levelShortName } from "@/lib/levels";

const ownerNav = [
  { href: "/owner", label: "店舗設定" },
  { href: "/owner/checks", label: "会社の行動指針" },
  { href: "/owner/staff", label: "スタッフ管理" },
];

export default async function OwnerHomePage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    levels_saved?: string;
    levels_error?: string;
  }>;
}) {
  const session = await requireOwner();
  const { saved, levels_saved, levels_error } = await searchParams;
  const store = await prisma.store.findUniqueOrThrow({
    where: { id: session.storeId },
  });
  const levelThresholds = thresholdsFromStore(store);

  const [staffCount, recordCount, checkCount] = await Promise.all([
    prisma.staff.count({
      where: { storeId: session.storeId, role: "STAFF" },
    }),
    prisma.dailyRecord.count({
      where: { staff: { storeId: session.storeId } },
    }),
    prisma.standardCheck.count({
      where: { storeId: session.storeId, isActive: true },
    }),
  ]);

  return (
    <AppShell title="オーナー管理" subtitle={store.name} nav={ownerNav}>
      {saved && (
        <p className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-900">
          店舗設定を保存しました。
        </p>
      )}
      {levels_saved && (
        <p className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-900">
          レベル別チェック回数を保存しました。全スタッフの指針レベルを再計算しました。
        </p>
      )}
      {levels_error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-900">
          {decodeURIComponent(levels_error)}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-teal-700">{staffCount}</p>
          <p className="text-xs text-slate-500">スタッフ</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-teal-700">{recordCount}</p>
          <p className="text-xs text-slate-500">累計記録</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-teal-700">{checkCount}</p>
          <p className="text-xs text-slate-500">有効チェック</p>
        </Card>
      </div>

      <Card>
        <CardTitle sub="スタッフのデイレポ画面・最上部に表示されます">
          会社のミッション・ビジョン・バリュー
        </CardTitle>
        <form action={updateStoreAction} className="space-y-4">
          <Input label="店舗名" name="name" defaultValue={store.name} />
          <Textarea
            label="ミッション"
            name="mission"
            rows={4}
            defaultValue={store.mission}
            placeholder="私たちは何のために存在するか"
          />
          <Textarea
            label="ビジョン"
            name="vision"
            rows={4}
            defaultValue={store.vision}
            placeholder="目指す未来像"
          />
          <Textarea
            label="バリュー"
            name="values"
            rows={4}
            defaultValue={store.values}
            placeholder="大切にする価値観・行動原則"
          />
          <Input
            label="ブランディングPDF URL"
            name="pdfUrl"
            type="url"
            defaultValue={store.pdfUrl ?? ""}
            placeholder="https://..."
          />
          <Button type="submit">店舗設定を保存</Button>
        </form>
      </Card>

      <Card>
        <CardTitle sub="個人行動指針の習慣レベル（Lv1〜5）。累計チェック回数が閾値以上でレベルアップします">
          レベル別チェック回数
        </CardTitle>
        <p className="mb-4 text-sm text-slate-600">
          Lv1は0回から開始です。Lv2〜5は「累計○回以上」で到達します。値は昇順（Lv2
          &lt; Lv3 &lt; Lv4 &lt; Lv5）にしてください。
        </p>
        <form action={saveLevelThresholdsAction} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Lv1 {levelShortName(1)}
              </span>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                0〜{levelThresholds.level2 - 1}回（設定不要）
              </div>
            </label>
            <Input
              label={`Lv2 ${levelShortName(2)} — 到達（累計回数以上）`}
              name="level2MinChecks"
              type="number"
              min={1}
              required
              defaultValue={store.level2MinChecks}
            />
            <Input
              label={`Lv3 ${levelShortName(3)} — 到達（累計回数以上）`}
              name="level3MinChecks"
              type="number"
              min={1}
              required
              defaultValue={store.level3MinChecks}
            />
            <Input
              label={`Lv4 ${levelShortName(4)} — 到達（累計回数以上）`}
              name="level4MinChecks"
              type="number"
              min={1}
              required
              defaultValue={store.level4MinChecks}
            />
            <Input
              label={`Lv5 ${levelShortName(5)} — 到達（累計回数以上）`}
              name="level5MinChecks"
              type="number"
              min={1}
              required
              defaultValue={store.level5MinChecks}
            />
          </div>
          <Button type="submit">レベル設定を保存</Button>
        </form>
      </Card>

      <Card>
        <CardTitle>クイックリンク</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Link href="/owner/checks">
            <Button variant="secondary">会社の行動指針</Button>
          </Link>
          <Link href="/owner/staff">
            <Button variant="secondary">スタッフ一覧・振り返り</Button>
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}
