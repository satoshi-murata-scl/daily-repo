import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendLineNotify } from "@/lib/line-notify";
import { APP_TIMEZONE, todayDateOnly } from "@/lib/dates";

/**
 * 未入力スタッフへリマインダー送信
 * 呼び出し: GET /api/cron/daily-reminder?secret=CRON_SECRET
 * 本番: Vercel Cron や外部 cron で reminderTime 以降に1日1回実行
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const today = todayDateOnly();
  const hhmm = new Intl.DateTimeFormat("ja-JP", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/\s/g, "");

  const stores = await prisma.store.findMany({
    where: { reminderEnabled: true, lineNotifyToken: { not: null } },
    include: {
      staff: { where: { role: "STAFF" } },
    },
  });

  let sent = 0;

  for (const store of stores) {
    if (store.reminderTime > hhmm) continue;

    const token = store.lineNotifyToken!;

    for (const staff of store.staff) {
      const already = await prisma.reminderLog.findUnique({
        where: { staffId_date: { staffId: staff.id, date: today } },
      });
      if (already) continue;

      const record = await prisma.dailyRecord.findUnique({
        where: { staffId_date: { staffId: staff.id, date: today } },
      });
      if (record) continue;

      const url = `${store.appBaseUrl.replace(/\/$/, "")}/staff`;
      const message = [
        "【デイレポ】入力のお願い",
        `${staff.name}さん、本日のデイレポがまだ保存されていません。`,
        `入力期限の目安: ${store.reminderTime}`,
        `▼ こちらから入力`,
        url,
      ].join("\n");

      try {
        await sendLineNotify(token, message);
        await prisma.reminderLog.create({
          data: { staffId: staff.id, date: today },
        });
        sent++;
      } catch (e) {
        console.error("Reminder failed for", staff.email, e);
      }
    }
  }

  return NextResponse.json({ ok: true, sent, checkedAt: now.toISOString() });
}
