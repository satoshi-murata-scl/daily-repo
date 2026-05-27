import type { JobTitle } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { monthRange } from "@/lib/dates";
import { daysInCalendarMonth, startOfMonth } from "@/lib/month";
import {
  computeMeetingInsights,
  inputRatePercent,
  type GuidelineStat,
} from "@/lib/meeting-insights";
import { getMonthlyTaskReflection } from "@/lib/task-reflection";

export async function getMonthlyReflection(staffId: string, month = new Date()) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return null;

  const monthStart = startOfMonth(month);
  const { start, end } = monthRange(month);
  const daysInMonth = daysInCalendarMonth(month);

  const [records, guidelines, history, taskReflection, meetingNote] = await Promise.all([
    prisma.dailyRecord.findMany({
      where: { staffId, date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
      include: { guidelineChecks: { where: { done: true } } },
    }),
    prisma.actionGuideline.findMany({
      where: { staffId },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.levelHistory.findMany({
      where: {
        staffId,
        changedAt: { gte: start, lte: end },
      },
      orderBy: { changedAt: "desc" },
      take: 20,
    }),
    getMonthlyTaskReflection(staffId, start, end),
    prisma.meetingNote.findUnique({
      where: {
        staffId_month: { staffId, month: monthStart },
      },
    }),
  ]);

  const recordCount = records.length;
  const inputRate = inputRatePercent(recordCount, daysInMonth);

  const guidelineStats: GuidelineStat[] = guidelines
    .filter((g) => g.isActive || g.totalChecks > 0)
    .map((g) => {
      const count = records.filter((r) =>
        r.guidelineChecks.some((c) => c.guidelineId === g.id),
      ).length;
      return {
        id: g.id,
        title: g.title,
        count,
        level: g.level,
        totalChecks: g.totalChecks,
        isActive: g.isActive,
        ownerEvaluationLevel: g.ownerEvaluationLevel,
      };
    });

  const activeGuidelines = guidelineStats.filter((g) => g.isActive);
  const insights = computeMeetingInsights(activeGuidelines);

  const comments = records
    .filter((r) => r.comment.trim())
    .map((r) => ({ date: r.date, comment: r.comment }));

  return {
    staff,
    month: monthStart,
    recordCount,
    daysInMonth,
    inputRate,
    guidelineStats,
    activeGuidelines,
    insights,
    comments,
    history,
    tasksDone: taskReflection.tasksDone,
    tasksPending: taskReflection.tasksPending,
    tasksCarried: taskReflection.tasksCarried,
    taskReflection,
    meetingNote,
  };
}

export type StaffListSummary = {
  staffId: string;
  name: string;
  email: string;
  jobTitle: JobTitle;
  recordCount: number;
  daysInMonth: number;
  inputRate: number;
  guidelines: { title: string; count: number; level: number }[];
};

export async function getStaffListSummaries(
  storeId: string,
  month = new Date(),
): Promise<StaffListSummary[]> {
  const { start, end } = monthRange(month);
  const daysInMonth = daysInCalendarMonth(month);

  const staffList = await prisma.staff.findMany({
    where: { storeId, role: "STAFF" },
    orderBy: { name: "asc" },
    include: {
      actionGuidelines: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        take: 3,
      },
    },
  });

  if (staffList.length === 0) return [];

  const staffIds = staffList.map((s) => s.id);

  const [records, allGuidelines] = await Promise.all([
    prisma.dailyRecord.findMany({
      where: { staffId: { in: staffIds }, date: { gte: start, lte: end } },
      include: { guidelineChecks: { where: { done: true } } },
    }),
    prisma.actionGuideline.findMany({
      where: { staffId: { in: staffIds }, isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  const recordsByStaff = new Map<string, typeof records>();
  for (const r of records) {
    const list = recordsByStaff.get(r.staffId) ?? [];
    list.push(r);
    recordsByStaff.set(r.staffId, list);
  }

  const guidelinesByStaff = new Map<string, typeof allGuidelines>();
  for (const g of allGuidelines) {
    const list = guidelinesByStaff.get(g.staffId) ?? [];
    list.push(g);
    guidelinesByStaff.set(g.staffId, list);
  }

  return staffList.map((s) => {
    const staffRecords = recordsByStaff.get(s.id) ?? [];
    const recordCount = staffRecords.length;
    const staffGuidelines = guidelinesByStaff.get(s.id) ?? s.actionGuidelines;

    const guidelines = staffGuidelines.slice(0, 3).map((g) => ({
      title: g.title,
      count: staffRecords.filter((r) =>
        r.guidelineChecks.some((c) => c.guidelineId === g.id),
      ).length,
      level: g.level,
    }));

    return {
      staffId: s.id,
      name: s.name,
      email: s.email,
      jobTitle: s.jobTitle,
      recordCount,
      daysInMonth,
      inputRate: inputRatePercent(recordCount, daysInMonth),
      guidelines,
    };
  });
}
