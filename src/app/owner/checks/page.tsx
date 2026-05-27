import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { GuidelineFormGuide } from "@/components/owner/guideline-form-guide";
import { Button, Card, CardTitle, Input } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DeleteGuidelineButton } from "@/components/owner/delete-guideline-button";
import {
  deleteCheckAction,
  deleteRoleGuidelineAction,
  saveCheckAction,
  saveRoleGuidelineAction,
} from "@/lib/actions/owner";
import {
  JOB_TITLE_OPTIONS,
  jobTitleLabel,
  jobTitleToTab,
  parseJobTitleTab,
} from "@/lib/job-title";
import type { JobTitle } from "@/generated/prisma/client";

const ownerNav = [
  { href: "/owner", label: "店舗設定" },
  { href: "/owner/checks", label: "行動指針" },
  { href: "/owner/staff", label: "スタッフ管理" },
];

const COMPANY_TAB = "company";

export default async function OwnerChecksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const session = await requireOwner();
  const { tab: tabParam, error } = await searchParams;
  const activeTab = tabParam === COMPANY_TAB || !tabParam ? COMPANY_TAB : tabParam;
  const roleJobTitle = parseJobTitleTab(activeTab === COMPANY_TAB ? null : activeTab);

  if (tabParam && tabParam !== COMPANY_TAB && !roleJobTitle) {
    redirect("/owner/checks");
  }

  const [companyChecks, roleGuidelines] = await Promise.all([
    prisma.standardCheck.findMany({
      where: { storeId: session.storeId, isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    roleJobTitle
      ? prisma.roleGuideline.findMany({
          where: {
            storeId: session.storeId,
            jobTitle: roleJobTitle,
            isActive: true,
          },
          orderBy: { displayOrder: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const tabs: { key: string; label: string; jobTitle?: JobTitle }[] = [
    { key: COMPANY_TAB, label: "全員共通（会社）" },
    ...JOB_TITLE_OPTIONS.map((o) => ({
      key: jobTitleToTab(o.value),
      label: o.label,
      jobTitle: o.value,
    })),
  ];

  const isCompany = activeTab === COMPANY_TAB;
  const activeCount = isCompany ? companyChecks.length : roleGuidelines.length;
  const roleLabel = roleJobTitle ? jobTitleLabel(roleJobTitle) : "";

  return (
    <AppShell
      title="行動指針の管理"
      subtitle={
        isCompany
          ? `会社の行動指針（全スタッフ・読むだけ）・有効 ${activeCount}/10 件`
          : `${roleLabel}向け・有効 ${activeCount}/10 件`
      }
      nav={ownerNav}
    >
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((t) => {
          const href =
            t.key === COMPANY_TAB ? "/owner/checks" : `/owner/checks?tab=${t.key}`;
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {error === "limit" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          このタブは最大10件までです。
        </p>
      )}
      {error === "name" && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          内容を入力してください。
        </p>
      )}

      <p className="text-sm leading-relaxed text-slate-600">
        {isCompany ? (
          <>
            スタッフ画面「① 会社の軸」に表示されます。毎日1件がランダムに選ばれ、残りは折りたたみで見られます。
            個人の行動指針（毎日チェック）とは別です。
          </>
        ) : (
          <>
            役職が「{roleLabel}」のスタッフだけに表示されます。表示ルールは会社の行動指針と同じです（読むだけ・チェックなし）。
          </>
        )}
      </p>

      {isCompany ? (
        <>
          <Card>
            <CardTitle>登録済み（店舗共通）</CardTitle>
            <GuidelineFormGuide variant="list" />
            {companyChecks.length === 0 ? (
              <p className="text-sm text-slate-500">まだ項目がありません。</p>
            ) : (
              <ul className="space-y-4">
                {companyChecks.map((check) => (
                  <li
                    key={check.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                  >
                    <form
                      action={saveCheckAction}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem_auto] sm:items-end"
                    >
                      <input type="hidden" name="id" value={check.id} />
                      <Input
                        name="checkName"
                        defaultValue={check.checkName}
                        className="w-full"
                      />
                      <Input
                        name="displayOrder"
                        type="number"
                        min={1}
                        max={10}
                        defaultValue={check.displayOrder}
                        className="w-full sm:w-full"
                        aria-label="表示順"
                      />
                      <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                        更新
                      </Button>
                    </form>
                    <DeleteGuidelineButton action={deleteCheckAction}>
                      <input type="hidden" name="id" value={check.id} />
                    </DeleteGuidelineButton>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {activeCount < 10 && (
            <Card>
              <CardTitle>会社の行動指針を追加</CardTitle>
              <GuidelineFormGuide variant="add" />
              <form action={saveCheckAction} className="space-y-3">
                <Input
                  label="指針の内容"
                  name="checkName"
                  placeholder="例：関わる人が主役になる言動・行動を意識する"
                  required
                />
                <Input
                  label="表示順"
                  name="displayOrder"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={activeCount + 1}
                />
                <Button type="submit">追加する</Button>
              </form>
            </Card>
          )}
        </>
      ) : (
        roleJobTitle && (
          <>
            <Card>
              <CardTitle sub={`${roleLabel}向け・読むだけ`}>登録済み</CardTitle>
              <GuidelineFormGuide variant="list" />
              {roleGuidelines.length === 0 ? (
                <p className="text-sm text-slate-500">まだ項目がありません。</p>
              ) : (
                <ul className="space-y-4">
                  {roleGuidelines.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                    >
                      <form
                        action={saveRoleGuidelineAction}
                        className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem_auto] sm:items-end"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="jobTitle" value={roleJobTitle} />
                        <input type="hidden" name="tab" value={activeTab} />
                        <Input
                          name="title"
                          defaultValue={item.title}
                          className="w-full"
                        />
                        <Input
                          name="displayOrder"
                          type="number"
                          min={1}
                          max={10}
                          defaultValue={item.displayOrder}
                          className="w-full sm:w-full"
                          aria-label="表示順"
                        />
                        <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                          更新
                        </Button>
                      </form>
                      <DeleteGuidelineButton action={deleteRoleGuidelineAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="tab" value={activeTab} />
                      </DeleteGuidelineButton>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {activeCount < 10 && (
              <Card>
                <CardTitle>{roleLabel}向けの指針を追加</CardTitle>
                <GuidelineFormGuide variant="add" />
                <form action={saveRoleGuidelineAction} className="space-y-3">
                  <input type="hidden" name="jobTitle" value={roleJobTitle} />
                  <input type="hidden" name="tab" value={activeTab} />
                  <Input
                    label="指針の内容"
                    name="title"
                    placeholder="例：施術前にカウンセリング内容を声に出して確認する"
                    required
                  />
                  <Input
                    label="表示順"
                    name="displayOrder"
                    type="number"
                    min={1}
                    max={10}
                    defaultValue={activeCount + 1}
                  />
                  <Button type="submit">追加する</Button>
                </form>
              </Card>
            )}
          </>
        )
      )}
    </AppShell>
  );
}
