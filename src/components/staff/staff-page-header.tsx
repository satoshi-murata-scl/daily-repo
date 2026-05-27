import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui";

export function StaffPageHeader({
  title,
  subtitle,
  subtitleNode,
  compact,
  centerTitle,
  backHref,
  backLabel = "メインに戻る",
}: {
  title: string;
  subtitle?: string;
  subtitleNode?: ReactNode;
  compact?: boolean;
  centerTitle?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header
      className={`sticky top-0 z-30 -mx-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md safe-top ${
        compact ? "pb-2 pt-2" : "pb-3 pt-3"
      }`}
      style={{ marginTop: "calc(-1 * env(safe-area-inset-top, 0px))", paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}
    >
      {backHref && (
        <Link
          href={backHref}
          className="mb-2 inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-teal-800 touch-manipulation active:opacity-70"
        >
          <span aria-hidden>←</span>
          {backLabel}
        </Link>
      )}
      <div className={centerTitle ? "relative" : "flex items-start justify-between gap-3"}>
        {centerTitle ? (
          <div className="px-14 pb-1 pt-0.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
              デイレポ
            </p>
            <h1 className="mt-0.5 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
              {title}
            </h1>
            {subtitleNode ?? (subtitle && (
              <p className="mt-1 text-base font-medium text-slate-600">{subtitle}</p>
            ))}
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
              デイレポ
            </p>
            <h1 className="truncate text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
        )}
        <form
          action={logoutAction}
          className={centerTitle ? "absolute right-0 top-0" : "shrink-0"}
        >
          <Button
            type="submit"
            variant="ghost"
            className="min-h-[44px] px-2 text-xs text-slate-500"
          >
            ログアウト
          </Button>
        </form>
      </div>
    </header>
  );
}
