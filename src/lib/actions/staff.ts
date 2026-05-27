"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { todayDateOnly } from "@/lib/dates";
import { levelFromTotalChecks, thresholdsFromStore } from "@/lib/guideline-level";
import { MAX_ACTION_GUIDELINES } from "@/lib/guideline-limits";

export async function saveDailyReportAction(formData: FormData) {
  const session = await requireStaff();
  const today = todayDateOnly();

  const record = await prisma.dailyRecord.upsert({
    where: {
      staffId_date: { staffId: session.id, date: today },
    },
    create: {
      staffId: session.id,
      date: today,
      email: session.email,
      comment: String(formData.get("comment") ?? "").trim(),
      savedAt: new Date(),
    },
    update: {
      comment: String(formData.get("comment") ?? "").trim(),
      savedAt: new Date(),
    },
  });

  const [guidelines, store] = await Promise.all([
    prisma.actionGuideline.findMany({
      where: { staffId: session.id, isActive: true },
    }),
    prisma.store.findUniqueOrThrow({
      where: { id: session.storeId },
      select: {
        level2MinChecks: true,
        level3MinChecks: true,
        level4MinChecks: true,
        level5MinChecks: true,
      },
    }),
  ]);
  const levelThresholds = thresholdsFromStore(store);

  for (const g of guidelines) {
    const done = formData.get(`guideline_${g.id}`) === "on";
    const existing = await prisma.guidelineDailyCheck.findUnique({
      where: {
        dailyRecordId_guidelineId: {
          dailyRecordId: record.id,
          guidelineId: g.id,
        },
      },
    });

    const wasDone = existing?.done ?? false;

    await prisma.guidelineDailyCheck.upsert({
      where: {
        dailyRecordId_guidelineId: {
          dailyRecordId: record.id,
          guidelineId: g.id,
        },
      },
      create: {
        dailyRecordId: record.id,
        guidelineId: g.id,
        done,
      },
      update: { done },
    });

    // 当日のチェック状態が変わったときだけ累計を ±1（同日の入れ直しでは増えない）
    if (done !== wasDone) {
      const newTotal = Math.max(0, g.totalChecks + (done ? 1 : -1));
      const newLevel = levelFromTotalChecks(newTotal, levelThresholds);
      const oldLevel = g.level;

      await prisma.actionGuideline.update({
        where: { id: g.id },
        data: { totalChecks: newTotal, level: newLevel },
      });

      if (done && newLevel > oldLevel) {
        await prisma.levelHistory.create({
          data: {
            staffId: session.id,
            goalNo: g.displayOrder,
            oldLevel,
            newLevel,
            changedBy: session.email,
            guidelineId: g.id,
          },
        });
      }
    }
  }

  revalidatePath("/staff");
  revalidatePath("/staff/reflection");
}

export async function updatePersonalStatementAction(formData: FormData) {
  const session = await requireStaff();

  await prisma.staff.update({
    where: { id: session.id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      personalMission: String(formData.get("personalMission") ?? "").trim(),
      vision30Days: String(formData.get("vision30Days") ?? "").trim(),
      personalValues: String(formData.get("personalValues") ?? "").trim(),
    },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/settings");
}

export async function saveSettingsMemoAction(formData: FormData) {
  const session = await requireStaff();

  await prisma.staff.update({
    where: { id: session.id },
    data: {
      settingsMemo: String(formData.get("settingsMemo") ?? "").trim(),
    },
  });

  revalidatePath("/staff/settings");
}

export async function saveGoalsAction(formData: FormData) {
  const session = await requireStaff();

  await prisma.staff.update({
    where: { id: session.id },
    data: {
      goal1Title: String(formData.get("goal1Title") ?? "").trim(),
      goal1Desc: String(formData.get("goal1Desc") ?? "").trim(),
      goal2Title: String(formData.get("goal2Title") ?? "").trim(),
      goal2Desc: String(formData.get("goal2Desc") ?? "").trim(),
      goal3Title: String(formData.get("goal3Title") ?? "").trim(),
      goal3Desc: String(formData.get("goal3Desc") ?? "").trim(),
    },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/settings");
}

export async function saveGuidelinesAction(formData: FormData) {
  const session = await requireStaff();

  for (let i = 1; i <= MAX_ACTION_GUIDELINES; i++) {
    const title = String(formData.get(`guideline_${i}`) ?? "").trim();
    const id = String(formData.get(`guideline_id_${i}`) ?? "");

    if (id) {
      if (title) {
        await prisma.actionGuideline.update({
          where: { id, staffId: session.id },
          data: { title },
        });
      }
    } else if (title) {
      const count = await prisma.actionGuideline.count({
        where: { staffId: session.id, isActive: true },
      });
      if (count >= MAX_ACTION_GUIDELINES) continue;

      await prisma.actionGuideline.create({
        data: {
          staffId: session.id,
          title,
          displayOrder: count + 1,
        },
      });
    }
  }

  revalidatePath("/staff");
  revalidatePath("/staff/settings");
}

export async function deactivateGuidelineAction(formData: FormData) {
  const session = await requireStaff();
  const id = String(formData.get("id") ?? "");

  await prisma.actionGuideline.updateMany({
    where: { id, staffId: session.id },
    data: { isActive: false },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/settings");
}

