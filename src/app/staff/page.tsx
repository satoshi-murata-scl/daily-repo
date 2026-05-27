import Link from "next/link";
import { StaffPageHeader } from "@/components/staff/staff-page-header";
import { DailySaveHabitNotice } from "@/components/staff/daily-save-habit-notice";
import { StaffStickySave } from "@/components/staff/staff-sticky-save";
import { CompanySection } from "@/components/staff/company-section";
import { RoleGuidelineSection } from "@/components/staff/role-guideline-section";
import { GoalsReminderCard } from "@/components/staff/goals-reminder-card";
import { PersonalMvvCard } from "@/components/staff/personal-mvv-card";
import {
  Card,
  CardTitle,
  CheckboxRow,
  LevelBadge,
  Textarea,
} from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StaffDailyClock } from "@/components/staff/staff-daily-clock";
import { saveDailyReportAction } from "@/lib/actions/staff";
import { getAppDayKey, todayDateOnly } from "@/lib/dates";

const FORM_ID = "daily-report-form";

export default async function StaffDailyPage() {
  const session = await requireStaff();
  const today = todayDateOnly();
  const todayKey = getAppDayKey(today);

  const staff = await prisma.staff.findUniqueOrThrow({ where: { id: session.id } });

  const [store, companyGuidelines, roleGuidelines, guidelines, record] =
    await Promise.all([
      prisma.store.findUniqueOrThrow({ where: { id: session.storeId } }),
      prisma.standardCheck.findMany({
        where: { storeId: session.storeId, isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.roleGuideline.findMany({
        where: {
          storeId: session.storeId,
          isActive: true,
          jobTitle: staff.jobTitle,
        },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.actionGuideline.findMany({
        where: { staffId: session.id, isActive: true },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.dailyRecord.findUnique({
        where: { staffId_date: { staffId: session.id, date: today } },
        include: { guidelineChecks: true },
      }),
    ]);

  const recordForToday =
    record && getAppDayKey(record.date) === todayKey ? record : null;

  const guidelineDoneMap = new Map(
    recordForToday?.guidelineChecks.map((c) => [c.guidelineId, c.done]) ?? [],
  );

  const goals = [
    { title: staff.goal1Title, desc: staff.goal1Desc },
    { title: staff.goal2Title, desc: staff.goal2Desc },
    { title: staff.goal3Title, desc: staff.goal3Desc },
  ];

  const hasMvv =
    staff.personalMission || staff.vision30Days || staff.personalValues;

  return (
    <>
      <StaffPageHeader
        title={staff.name}
        subtitleNode={<StaffDailyClock initialDayKey={todayKey} />}
        compact
        centerTitle
      />

      <CompanySection
        staffId={session.id}
        today={today}
        statementTitle={store.statementTitle}
        statement={store.statement}
        companyGuidelines={companyGuidelines}
      />

      <div className="mt-3">
        <RoleGuidelineSection
          staffId={session.id}
          today={today}
          jobTitle={staff.jobTitle}
          roleGuidelines={roleGuidelines}
        />
      </div>

      <div className="mt-4">
        <GoalsReminderCard goals={goals} />
        {hasMvv && (
          <Card className="mt-3 border-indigo-100 bg-indigo-50/20">
            <PersonalMvvCard
              mission={staff.personalMission}
              vision={staff.vision30Days}
              values={staff.personalValues}
            />
          </Card>
        )}
      </div>

      <form
        key={todayKey}
        id={FORM_ID}
        action={saveDailyReportAction}
        className="mt-4 space-y-3 sm:space-y-4"
      >
        {recordForToday && (
          <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            本日分は保存済みです。変更する場合は下のボタンから再保存してください。
          </p>
        )}

        <div className="rounded-xl border border-teal-300 bg-teal-50/80 px-3 py-2.5 text-center">
          <p className="text-xs font-semibold text-teal-900">
            ③ 今日の記録（チェック → 一言 → 保存）
          </p>
        </div>

        <DailySaveHabitNotice />

        <Card>
          <CardTitle sub="毎日の習慣・目標から細分化した行動">
            個人の行動指針
          </CardTitle>
          {guidelines.length === 0 ? (
            <p className="text-sm text-slate-500">
              未登録です。{" "}
              <Link href="/staff/settings" className="font-medium text-teal-700 underline">
                設定画面
              </Link>
              で登録するか、オーナーから追加してもらってください。
            </p>
          ) : (
            <div className="space-y-2.5">
              {guidelines.map((g) => (
                <CheckboxRow
                  key={g.id}
                  id={`guideline-${g.id}`}
                  name={`guideline_${g.id}`}
                  label={g.title}
                  badge={
                    <span className="flex items-center gap-1.5">
                      <LevelBadge level={g.level} />
                      <span className="text-[10px] text-slate-400">
                        累計{g.totalChecks}回
                      </span>
                    </span>
                  }
                  defaultChecked={guidelineDoneMap.get(g.id) ?? false}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle sub="気づき・できたこと（推奨）">
            今日の一言
          </CardTitle>
          <Textarea
            name="comment"
            rows={3}
            placeholder="気づき・できたこと・明日やること"
            defaultValue={recordForToday?.comment ?? ""}
          />
        </Card>
      </form>

      <StaffStickySave
        formId={FORM_ID}
        saved={!!recordForToday}
        hint="①②を確認 → ③で保存（できなくても毎日）。チェックだけでは記録されません"
      />
    </>
  );
}
