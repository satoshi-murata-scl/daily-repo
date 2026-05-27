import { prisma } from "@/lib/db";
import { startOfDay, subDays } from "date-fns";

/** 未完了の非日次タスクを翌日へ繰越 */
export async function carryOverTasks(staffId: string, today: Date) {
  const yesterday = startOfDay(subDays(today, 1));

  const pending = await prisma.businessTask.findMany({
    where: {
      staffId,
      targetDate: yesterday,
      status: "PENDING",
      isDaily: false,
    },
  });

  for (const task of pending) {
    const exists = await prisma.businessTask.findFirst({
      where: {
        staffId,
        carriedFromId: task.id,
        targetDate: today,
      },
    });
    if (exists) continue;

    await prisma.$transaction([
      prisma.businessTask.update({
        where: { id: task.id },
        data: { status: "CARRIED" },
      }),
      prisma.businessTask.create({
        data: {
          staffId,
          title: task.title,
          isDaily: false,
          targetDate: today,
          status: "PENDING",
          carriedFromId: task.id,
        },
      }),
    ]);
  }
}

export async function getTodayTasks(staffId: string, today: Date) {
  return prisma.businessTask.findMany({
    where: {
      staffId,
      targetDate: today,
      status: { in: ["PENDING", "DONE"] },
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });
}
