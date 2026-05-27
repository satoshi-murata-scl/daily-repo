import { Card, CardTitle } from "@/components/ui";
import { splitSpotlight, type SpotlightItem } from "@/lib/daily-guideline";

export function GuidelineSpotlightSection({
  title,
  subtitle,
  spotlightSubtitle,
  items,
  seedKey,
  emptyMessage,
  collapseLabel,
}: {
  title: string;
  subtitle?: string;
  spotlightSubtitle?: string;
  items: SpotlightItem[];
  seedKey: string;
  emptyMessage: string;
  collapseLabel: (restCount: number) => string;
}) {
  const { today, others } = splitSpotlight(items, seedKey);

  return (
    <Card className="border-slate-200 bg-slate-50/50">
      <CardTitle sub={subtitle}>{title}</CardTitle>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <>
          <div className="rounded-xl border border-teal-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {spotlightSubtitle ?? "今日のひとつ"}
            </p>
            <p className="mt-2 text-[17px] font-medium leading-relaxed text-slate-900">
              {today?.title}
            </p>
          </div>

          {others.length > 0 && (
            <details className="mt-3 group">
              <summary className="cursor-pointer list-none text-sm font-medium text-teal-800 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="underline decoration-teal-300 underline-offset-2">
                  {collapseLabel(others.length)}
                </span>
              </summary>
              <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {others.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 text-sm leading-relaxed text-slate-700"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    {item.title}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </Card>
  );
}
