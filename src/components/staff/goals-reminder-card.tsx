import Link from "next/link";
import { Card, CardTitle } from "@/components/ui";

type Goal = { title: string; desc: string };

export function GoalsReminderCard({ goals }: { goals: Goal[] }) {
  const active = goals.filter((g) => g.title.trim());

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        ② 自分の目標（忘れないため）
      </p>
      <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40">
        <CardTitle sub="細分化は下の「行動指針」へ">
          個人ステートメント・目標
        </CardTitle>

        {active.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <p className="text-sm text-slate-600">目標が未設定です</p>
            <Link
              href="/staff/settings"
              className="mt-2 inline-block text-sm font-semibold text-teal-700 underline"
            >
              設定画面で入力する
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {active.map((g, i) => (
              <li key={i} className="rounded-lg bg-white/80 px-3 py-2">
                <p className="font-medium text-slate-900">{g.title}</p>
                {g.desc && (
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{g.desc}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-center">
          <Link href="/staff/settings" className="text-xs font-medium text-teal-700 underline">
            目標・行動指針を編集 →
          </Link>
        </p>
      </Card>
    </div>
  );
}
