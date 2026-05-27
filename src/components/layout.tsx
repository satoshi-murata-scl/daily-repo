import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui";

export function AppShell({
  title,
  subtitle,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/30">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              デイレポ
            </p>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="text-xs">
              ログアウト
            </Button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 pb-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">{children}</main>
    </div>
  );
}
