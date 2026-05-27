import {
  addMonths,
  endOfMonth,
  format,
  getDate,
  parse,
  startOfMonth,
  subMonths,
} from "date-fns";

/** ?month=YYYY-MM を月初 Date に変換（無効時は今月） */
export function parseMonthParam(monthStr?: string | null): Date {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    return startOfMonth(new Date());
  }
  const parsed = parse(`${monthStr}-01`, "yyyy-MM-dd", new Date());
  return startOfMonth(parsed);
}

export function formatMonthParam(date: Date): string {
  return format(startOfMonth(date), "yyyy-MM");
}

export function daysInCalendarMonth(date: Date): number {
  return getDate(endOfMonth(date));
}

export function monthNavUrls(staffId: string, month: Date) {
  const param = formatMonthParam(month);
  const prev = formatMonthParam(subMonths(month, 1));
  const next = formatMonthParam(addMonths(month, 1));
  const base = `/owner/staff/${staffId}`;
  return {
    current: `${base}?month=${param}`,
    prev: `${base}?month=${prev}`,
    next: `${base}?month=${next}`,
    param,
  };
}

export function staffListMonthUrl(month: Date) {
  return `/owner/staff?month=${formatMonthParam(month)}`;
}

export function staffListMonthNavUrls(month: Date) {
  const param = formatMonthParam(month);
  const prev = formatMonthParam(subMonths(month, 1));
  const next = formatMonthParam(addMonths(month, 1));
  return {
    prev: `/owner/staff?month=${prev}`,
    next: `/owner/staff?month=${next}`,
    param,
  };
}

export function staffReflectionMonthNavUrls(month: Date) {
  const param = formatMonthParam(month);
  const prev = formatMonthParam(subMonths(month, 1));
  const now = startOfMonth(new Date());
  const nextMonth = startOfMonth(addMonths(month, 1));
  const hasNext = nextMonth <= now;
  return {
    prev: `/staff/reflection?month=${prev}`,
    next: hasNext
      ? `/staff/reflection?month=${formatMonthParam(nextMonth)}`
      : undefined,
    param,
    hasNext,
  };
}

export { startOfMonth } from "date-fns";
