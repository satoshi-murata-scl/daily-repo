"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STAFF_NAV } from "@/lib/staff-nav";

function NavIcon({ href, active }: { href: string; active: boolean }) {
  const stroke = active ? "#0f766e" : "#64748b";
  const className = "h-6 w-6";

  if (href === "/staff") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    );
  }
  if (href === "/staff/settings") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a2 2 0 002 2h4" />
    </svg>
  );
}

const navItemClass = (active: boolean) =>
  `flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 touch-manipulation transition-colors ${
    active ? "bg-teal-50 text-teal-800" : "text-slate-500 active:bg-slate-100"
  }`;

export function StaffBottomNav({ pdfUrl }: { pdfUrl?: string | null }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="スタッフメニュー"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {STAFF_NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/staff" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={navItemClass(active)}>
              <NavIcon href={item.href} active={active} />
              <span
                className={`text-[10px] font-medium leading-tight sm:text-[11px] ${active ? "text-teal-800" : ""}`}
              >
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={navItemClass(false)}
            aria-label="ブランディング資料PDFを開く"
          >
            <PdfIcon />
            <span className="text-[10px] font-medium leading-tight sm:text-[11px]">資料PDF</span>
          </a>
        )}
      </div>
    </nav>
  );
}
