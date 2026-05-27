import { Card, CardTitle } from "@/components/ui";

export function PersonalMvvCard({
  mission,
  vision,
  values,
}: {
  mission: string;
  vision: string;
  values: string;
}) {
  const empty = !mission && !vision && !values;

  if (empty) return null;

  return (
    <div className="space-y-3 border-t border-indigo-100/80 pt-3">
      {mission && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            個人ミッション
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
            {mission}
          </p>
        </section>
      )}
      {vision && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            ビジョン
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
            {vision}
          </p>
        </section>
      )}
      {values && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            個人バリュー
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
            {values}
          </p>
        </section>
      )}
    </div>
  );
}
