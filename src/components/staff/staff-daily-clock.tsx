"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatStaffDailyDateTime, getAppDayKey } from "@/lib/dates";

/** 日付・時刻表示。0時（JST）を過ぎたら画面を更新し、新しい日の入力欄に切り替える */
export function StaffDailyClock({ initialDayKey }: { initialDayKey: string }) {
  const router = useRouter();
  const [label, setLabel] = useState(() => formatStaffDailyDateTime());
  const [dayKey, setDayKey] = useState(initialDayKey);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLabel(formatStaffDailyDateTime(now));
      const currentKey = getAppDayKey(now);
      if (currentKey !== dayKey) {
        setDayKey(currentKey);
        router.refresh();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [dayKey, router]);

  return (
    <p className="mt-1 text-base font-medium tabular-nums text-slate-600">{label}</p>
  );
}
