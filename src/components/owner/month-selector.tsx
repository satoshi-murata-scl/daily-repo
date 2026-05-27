import Link from "next/link";
import { formatMonthJa } from "@/lib/dates";

export function MonthSelector({
  month,
  prevHref,
  nextHref,
  nextDisabled,
  listHref,
}: {
  month: Date;
  prevHref: string;
  nextHref?: string;
  nextDisabled?: boolean;
  listHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <Link
          href={prevHref}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          ← 前月
        </Link>
        <span className="min-w-[100px] text-center text-sm font-semibold text-slate-900">
          {formatMonthJa(month)}
        </span>
        {nextDisabled || !nextHref ? (
          <span
            className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-300"
            aria-disabled
          >
            次月 →
          </span>
        ) : (
          <Link
            href={nextHref}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            次月 →
          </Link>
        )}
      </div>
      {listHref && (
        <Link href={listHref} className="text-xs text-teal-700 underline">
          一覧へ
        </Link>
      )}
    </div>
  );
}
