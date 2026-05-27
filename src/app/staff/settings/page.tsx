import { StaffPageHeader } from "@/components/staff/staff-page-header";
import { Button, Card, CardTitle, Input, Textarea } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  updatePersonalStatementAction,
  saveGoalsAction,
  saveGuidelinesAction,
  deactivateGuidelineAction,
  saveSettingsMemoAction,
} from "@/lib/actions/staff";
import {
  formatLevelThresholdGuide,
  thresholdsFromStore,
} from "@/lib/guideline-level";
import { MAX_ACTION_GUIDELINES } from "@/lib/guideline-limits";

export default async function StaffSettingsPage() {
  const session = await requireStaff();
  const [staff, store] = await Promise.all([
    prisma.staff.findUniqueOrThrow({
      where: { id: session.id },
    }),
    prisma.store.findUniqueOrThrow({
      where: { id: session.storeId },
    }),
  ]);
  const levelGuide = formatLevelThresholdGuide(thresholdsFromStore(store));
  const guidelines = await prisma.actionGuideline.findMany({
    where: { staffId: session.id, isActive: true },
    orderBy: { displayOrder: "asc" },
  });
  const slots = Array.from({ length: MAX_ACTION_GUIDELINES }, (_, i) => ({
    order: i + 1,
    item: guidelines[i],
  }));

  return (
    <>
      <StaffPageHeader
        title="目標・行動の設定"
        subtitle="たまに更新（毎日のデイレポとは別）"
        backHref="/staff"
        backLabel="メインに戻る"
      />

      <form
        action={updatePersonalStatementAction}
        className="mt-3 space-y-3 sm:space-y-4"
      >
        <Card>
          <CardTitle>基本情報</CardTitle>
          <Input label="名前" name="name" defaultValue={staff.name} required />
        </Card>

        <Card>
          <CardTitle sub="② 毎日のデイレポ上部に表示（チェックなし）">
            個人ステートメント（MVV）
          </CardTitle>
          <div className="space-y-3">
            <Textarea
              label="個人ミッション"
              name="personalMission"
              rows={3}
              defaultValue={staff.personalMission}
              placeholder="私は〇〇を通じて〇〇に貢献する"
            />
            <Textarea
              label="ビジョン"
              name="vision30Days"
              rows={3}
              defaultValue={staff.vision30Days}
              placeholder="〇〇になっている／目指す姿"
            />
            <Textarea
              label="個人バリュー"
              name="personalValues"
              rows={3}
              defaultValue={staff.personalValues}
              placeholder="大切にする価値観"
            />
          </div>
        </Card>

        <Button type="submit" className="w-full py-3.5 text-base font-semibold">
          ステートメントを保存
        </Button>
      </form>

      <form action={saveGoalsAction} className="mt-4 space-y-3">
        <Card>
          <CardTitle sub="② 忘れないための目標。毎日の○×は付けません">
            目標（最大3つ）
          </CardTitle>
          <p className="mb-3 text-xs text-slate-500">
            細分化: 毎日繰り返す習慣 → 下の「行動指針」
          </p>
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <Input
                label={`目標 ${n}（タイトル）`}
                name={`goal${n}Title`}
                defaultValue={
                  n === 1
                    ? staff.goal1Title
                    : n === 2
                      ? staff.goal2Title
                      : staff.goal3Title
                }
                placeholder="例：3ヶ月後に〇〇な美容師になっている"
              />
              <Textarea
                label={`目標 ${n}（補足・期限のイメージ）`}
                name={`goal${n}Desc`}
                rows={2}
                defaultValue={
                  n === 1
                    ? staff.goal1Desc
                    : n === 2
                      ? staff.goal2Desc
                      : staff.goal3Desc
                }
                placeholder="任意"
              />
            </div>
          ))}
          <Button type="submit" variant="secondary" className="mt-3 w-full">
            目標を保存
          </Button>
        </Card>
      </form>

      <form action={saveGuidelinesAction} className="mt-4 space-y-3">
        <Card>
          <CardTitle sub={`③ 毎日チェックする習慣（最大${MAX_ACTION_GUIDELINES}）`}>
            個人の行動指針
          </CardTitle>
          <p className="mb-3 text-xs text-slate-500">
            レベル目安:{" "}
            {levelGuide}
          </p>
          <div className="space-y-3">
            {slots.map(({ order, item }) => (
              <div key={order}>
                <input
                  type="hidden"
                  name={`guideline_id_${order}`}
                  value={item?.id ?? ""}
                />
                <Input
                  label={`行動指針 ${order}`}
                  name={`guideline_${order}`}
                  defaultValue={item?.title ?? ""}
                  placeholder="例：報告は結論ファーストで行う"
                />
                {item && (
                  <p className="mt-1 text-xs text-slate-500">
                    Lv{item.level} ・ 累計{item.totalChecks}回達成
                  </p>
                )}
              </div>
            ))}
          </div>
          <Button type="submit" variant="secondary" className="mt-4 w-full">
            行動指針を保存
          </Button>
        </Card>
      </form>

      {guidelines.length > 0 && (
        <Card className="mt-3">
          <CardTitle sub="習慣化できた項目を無効化">
            行動指針の削除
          </CardTitle>
          <ul className="space-y-2">
            {guidelines.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="text-sm text-slate-800">{g.title}</span>
                <form action={deactivateGuidelineAction}>
                  <input type="hidden" name="id" value={g.id} />
                  <Button type="submit" variant="ghost" className="text-xs text-rose-600">
                    削除
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <form action={saveSettingsMemoAction} className="mt-3">
        <Card>
          <CardTitle sub="枠に入りきらなかった目標・行動指針を自分用に残す（デイレポには表示されません）">
            ストックメモ
          </CardTitle>
          <Textarea
            name="settingsMemo"
            rows={6}
            defaultValue={staff.settingsMemo}
            placeholder="例：半年以内に〇〇の資格を取る／〇〇の接客フレーズを試す …"
          />
          <Button type="submit" variant="secondary" className="mt-3 w-full">
            メモを保存
          </Button>
        </Card>
      </form>
    </>
  );
}
