import { endOfMonth, format, startOfMonth } from "date-fns";
import { ja } from "date-fns/locale";

/** デイレポの「今日」判定に使うタイムゾーン（日本向け） */
export const APP_TIMEZONE = "Asia/Tokyo";

/** JST のカレンダー日 yyyy-MM-dd */
export function getAppDayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** その日 0:00（JST）を表す Date（DB の date キー用） */
export function todayDateOnly(): Date {
  const key = getAppDayKey();
  return new Date(`${key}T00:00:00+09:00`);
}

export function isSameAppDay(a: Date, b: Date): boolean {
  return getAppDayKey(a) === getAppDayKey(b);
}

export function formatDateJa(date: Date) {
  return format(date, "yyyy/MM/dd", { locale: ja });
}

/** スタッフ入力画面ヘッダー用（例: 2026年5月26日（月） 18:45） */
export function formatStaffDailyDateTime(date = new Date()): string {
  const datePart = new Intl.DateTimeFormat("ja-JP", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("ja-JP", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${datePart} ${timePart}`;
}

/** @deprecated 日付のみ表示用。新規は formatStaffDailyDateTime を使用 */
export function formatStaffDailyDate(date: Date) {
  return formatStaffDailyDateTime(date).replace(/\s\d{1,2}:\d{2}$/, "");
}

export function formatDateTimeJa(date: Date) {
  return format(date, "yyyy/MM/dd HH:mm", { locale: ja });
}

export function monthRange(date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function formatMonthJa(date = new Date()) {
  return format(date, "yyyy年M月", { locale: ja });
}
