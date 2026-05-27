import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { formatMonthJa } from "@/lib/dates";
import { parseMonthParam } from "@/lib/month";
import { getMonthlyReflection, getStaffListSummaries } from "@/lib/reflection";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  const session = await requireOwner();
  const monthParam = request.nextUrl.searchParams.get("month");
  const month = parseMonthParam(monthParam);

  const summaries = await getStaffListSummaries(session.storeId, month);
  const details = await Promise.all(
    summaries.map(async (s) => {
      const data = await getMonthlyReflection(s.staffId, month);
      return { summary: s, data };
    }),
  );

  const maxGuidelines = Math.max(
    0,
    ...details.map((d) => d.data?.activeGuidelines.length ?? 0),
  );

  const header = [
    "名前",
    "記録日数",
    "入力率(%)",
    ...Array.from({ length: maxGuidelines }, (_, i) => [
      `指針${i + 1}名`,
      `指針${i + 1}達成日数`,
    ]).flat(),
    "一言件数",
    "完了タスク数",
  ];

  const rows = details.map(({ summary, data }) => {
    const guidelines = data?.activeGuidelines ?? [];
    const guidelineCols: (string | number)[] = [];
    for (let i = 0; i < maxGuidelines; i++) {
      const g = guidelines[i];
      guidelineCols.push(g?.title ?? "", g?.count ?? "");
    }
    return [
      summary.name,
      summary.recordCount,
      summary.inputRate,
      ...guidelineCols,
      data?.comments.length ?? 0,
      data?.tasksDone ?? 0,
    ];
  });

  const bom = "\uFEFF";
  const body = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const filename = `staff-summary-${formatMonthJa(month).replace(/\s/g, "")}.csv`;

  return new NextResponse(bom + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
