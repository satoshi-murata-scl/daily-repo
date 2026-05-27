import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createStaffByMakerAction,
  createStoreByMakerAction,
  makerLogoutAction,
  readMakerFlash,
  resetStaffPasswordAction,
  updateMaxStaffAction,
} from "@/lib/actions/maker";
import { isMakerSession, requireMakerSession } from "@/lib/maker-auth";
import { prisma } from "@/lib/db";
import { readStaffCreatedFlash } from "@/lib/staff-created-flash";
import { countStoreStaff } from "@/lib/staff-quota";
import { FlashCookieClear } from "@/components/flash-cookie-clear";
import { JobTitleSelect } from "@/components/job-title-select";
import { Button, Card, CardTitle, Input } from "@/components/ui";
import { jobTitleLabel } from "@/lib/job-title";

export default async function MakerPage({
  searchParams,
}: {
  searchParams: Promise<{
    store?: string;
    saved?: string;
    created?: string;
    store_created?: string;
    reset?: string;
    error?: string;
  }>;
}) {
  if (!(await isMakerSession())) {
    redirect("/maker/login");
  }
  await requireMakerSession();

  const params = await searchParams;
  const [createdFlash, resetFlash] = await Promise.all([
    readStaffCreatedFlash(),
    readMakerFlash(),
  ]);

  const stores = await prisma.store.findMany({
    orderBy: { storeCode: "asc" },
    include: {
      staff: {
        where: { role: "STAFF" },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true, jobTitle: true, createdAt: true },
      },
    },
  });

  const selected =
    stores.find((s) => s.storeCode === params.store) ?? stores[0] ?? null;

  const staffCount = selected ? await countStoreStaff(selected.id) : 0;
  const showFlash = Boolean(createdFlash || resetFlash);

  return (
    <div className="mx-auto min-h-dvh max-w-2xl bg-slate-50 p-4 pb-16">
      <FlashCookieClear active={showFlash} />
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            デイレポ / 製作者
          </p>
          <h1 className="text-2xl font-bold text-slate-900">店舗プロビジョニング</h1>
        </div>
        <form action={makerLogoutAction}>
          <Button type="submit" variant="secondary">
            ログアウト
          </Button>
        </form>
      </header>

      {params.saved && (
        <p className="mb-4 rounded-xl bg-teal-50 px-4 py-2.5 text-sm text-teal-900">
          スタッフ上限を保存しました。
        </p>
      )}

      {params.store_created && (
        <p className="mb-4 rounded-xl bg-teal-50 px-4 py-2.5 text-sm text-teal-900">
          店舗とオーナーアカウントを作成しました。オーナーは /login からログインできます。
        </p>
      )}

      {(createdFlash || resetFlash) && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardTitle>
            {resetFlash
              ? "パスワードを再設定しました"
              : params.store_created
                ? "オーナーアカウント（ログイン情報）"
                : "スタッフを作成しました"}
          </CardTitle>
          <p className="text-sm text-slate-800">
            <strong>{(resetFlash ?? createdFlash)!.name}</strong>（
            {(resetFlash ?? createdFlash)!.email}）
          </p>
          <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-sm">
            初期パスワード: <strong>{(resetFlash ?? createdFlash)!.password}</strong>
          </p>
          <p className="mt-2 text-xs text-amber-900">
            この画面を閉じると再表示できません。店舗オーナーへ安全な経路でお渡しください。
          </p>
        </Card>
      )}

      {params.error === "quota" && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          スタッフ上限に達しています。上限を増やしてから作成してください。
        </p>
      )}
      {params.error === "exists" && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          このメールアドレスは既に登録されています。
        </p>
      )}
      {params.error === "below_current" && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          上限を現在の登録人数より少なくすることはできません。
        </p>
      )}
      {params.error === "invalid" && (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          入力内容を確認してください（店舗名・メール・パスワード6文字以上）。
        </p>
      )}

      <Card className="mb-4 border-teal-200 bg-teal-50/40">
        <CardTitle sub="店舗コードは自動で STORE001 形式を割り当てます">
          店舗新規作成
        </CardTitle>
        <form action={createStoreByMakerAction} className="space-y-3">
          <Input label="店舗名" name="storeName" required placeholder="例：〇〇美容室" />
          <Input
            label="オーナーのメールアドレス"
            name="ownerEmail"
            type="email"
            required
            placeholder="owner@example.com"
          />
          <Input
            label="オーナーの初期パスワード（6文字以上）"
            name="ownerPassword"
            type="password"
            minLength={6}
            required
            placeholder="ログイン用パスワード"
          />
          <Button type="submit" className="w-full">
            店舗を作成
          </Button>
        </form>
      </Card>

      {stores.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            まだ店舗がありません。上のフォームから最初の店舗を作成してください。
          </p>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <CardTitle>店舗を選択</CardTitle>
            <ul className="flex flex-wrap gap-2">
              {stores.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/maker?store=${s.storeCode}`}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      selected?.id === s.id
                        ? "bg-teal-700 font-medium text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {s.name}（{s.storeCode}）
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {selected && (
            <>
              <Card className="mb-4">
                <CardTitle>スタッフ枠（登録上限）</CardTitle>
                <p className="mb-3 text-sm text-slate-600">
                  現在 <strong>{staffCount}</strong> 名 / 上限{" "}
                  <strong>{selected.maxStaff}</strong> 名
                </p>
                <form action={updateMaxStaffAction} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="storeId" value={selected.id} />
                  <input type="hidden" name="storeCode" value={selected.storeCode} />
                  <Input
                    label="上限人数"
                    name="maxStaff"
                    type="number"
                    min={staffCount}
                    max={500}
                    defaultValue={selected.maxStaff}
                    className="w-28"
                  />
                  <Button type="submit">保存</Button>
                </form>
              </Card>

              <Card className="mb-4">
                <CardTitle sub="初期パスワードは作成直後のみ表示されます">
                  スタッフアカウントを作成
                </CardTitle>
                <form action={createStaffByMakerAction} className="space-y-3">
                  <input type="hidden" name="storeId" value={selected.id} />
                  <input type="hidden" name="storeCode" value={selected.storeCode} />
                  <Input label="名前" name="name" required />
                  <Input label="メールアドレス" name="email" type="email" required />
                  <Input
                    label="初期パスワード（6文字以上）"
                    name="password"
                    type="password"
                    minLength={6}
                    required
                    placeholder="店舗へ安全に共有"
                  />
                  <JobTitleSelect />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={staffCount >= selected.maxStaff}
                  >
                    {staffCount >= selected.maxStaff
                      ? "上限に達しています"
                      : "スタッフを作成"}
                  </Button>
                </form>
              </Card>

              <Card>
                <CardTitle>登録済みスタッフ</CardTitle>
                {selected.staff.length === 0 ? (
                  <p className="text-sm text-slate-500">まだいません。</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {selected.staff.map((s) => (
                      <li key={s.id} className="py-4">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-slate-500">
                          {s.email} · {jobTitleLabel(s.jobTitle)}
                        </p>
                        <form
                          action={resetStaffPasswordAction}
                          className="mt-3 flex flex-wrap items-end gap-2"
                        >
                          <input type="hidden" name="staffId" value={s.id} />
                          <input type="hidden" name="storeCode" value={selected.storeCode} />
                          <Input
                            label="パスワード再設定"
                            name="password"
                            type="password"
                            minLength={6}
                            required
                            placeholder="新しい初期パスワード"
                            className="min-w-[200px] flex-1"
                          />
                          <Button type="submit" variant="secondary">
                            再設定
                          </Button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
