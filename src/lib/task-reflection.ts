import { startOfDay } from "date-fns";
import { prisma } from "@/lib/db";

export type CompletedTaskRow = {
  id: string;
  title: string;
  isDaily: boolean;
  completedAt: Date;
  targetDate: Date;
};

export type TasksByCompletionDay = {
  date: Date;
  count: number;
  dailyCount: number;
  tasks: { title: string; isDaily: boolean }[];
};

export type MonthlyTaskReflection = {
  tasksDone: number;
  tasksPending: number;
  tasksCarried: number;
  completedTasks: CompletedTaskRow[];
  completionsByDay: TasksByCompletionDay[];
  pendingTasks: { title: string; targetDate: Date; isDaily: boolean }[];
  carriedTasks: { title: string; targetDate: Date }[];
};

export async function getMonthlyTaskReflection(
  staffId: string,
  start: Date,
  end: Date,
): Promise<MonthlyTaskReflection> {
  const [completedTasks, tasksPending, tasksCarried, pendingTasks, carriedTasks] =
    await Promise.all([
      prisma.businessTask.findMany({
        where: {
          staffId,
          status: "DONE",
          completedAt: { gte: start, lte: end },
        },
        orderBy: { completedAt: "desc" },
        select: {
          id: true,
          title: true,
          isDaily: true,
          completedAt: true,
          targetDate: true,
        },
      }),
      prisma.businessTask.count({
        where: {
          staffId,
          status: "PENDING",
          targetDate: { gte: start, lte: end },
        },
      }),
      prisma.businessTask.count({
        where: {
          staffId,
          status: "CARRIED",
          targetDate: { gte: start, lte: end },
        },
      }),
      prisma.businessTask.findMany({
        where: {
          staffId,
          status: "PENDING",
          targetDate: { gte: start, lte: end },
        },
        orderBy: { targetDate: "asc" },
        select: { title: true, targetDate: true, isDaily: true },
        take: 20,
      }),
      prisma.businessTask.findMany({
        where: {
          staffId,
          status: "CARRIED",
          targetDate: { gte: start, lte: end },
        },
        orderBy: { targetDate: "desc" },
        select: { title: true, targetDate: true },
        take: 10,
      }),
    ]);

  const rows: CompletedTaskRow[] = completedTasks
    .filter((t): t is typeof t & { completedAt: Date } => t.completedAt != null)
    .map((t) => ({
      id: t.id,
      title: t.title,
      isDaily: t.isDaily,
      completedAt: t.completedAt,
      targetDate: t.targetDate,
    }));

  const dayMap = new Map<string, TasksByCompletionDay>();
  for (const t of rows) {
    const date = startOfDay(t.completedAt);
    const key = date.toISOString();
    const entry = dayMap.get(key) ?? {
      date,
      count: 0,
      dailyCount: 0,
      tasks: [],
    };
    entry.count += 1;
    if (t.isDaily) entry.dailyCount += 1;
    entry.tasks.push({ title: t.title, isDaily: t.isDaily });
    dayMap.set(key, entry);
  }

  const completionsByDay = [...dayMap.values()].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  return {
    tasksDone: rows.length,
    tasksPending,
    tasksCarried,
    completedTasks: rows,
    completionsByDay,
    pendingTasks,
    carriedTasks,
  };
}
