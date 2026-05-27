"use client";

import { useEffect } from "react";

/** フラッシュ表示後に一度だけ Cookie を削除する */
export function FlashCookieClear({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;
    void fetch("/api/flash/clear", { method: "POST" });
  }, [active]);

  return null;
}
