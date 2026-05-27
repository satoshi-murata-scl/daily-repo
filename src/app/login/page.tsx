import { loginAction } from "@/lib/actions/auth";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    const exists = await prisma.staff.findUnique({
      where: { id: session.id },
      select: { id: true },
    });
    if (exists) redirect("/");
    redirect("/api/auth/clear-session?error=session");
  }
  const { error } = await searchParams;

  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 safe-x"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            デイレポ
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">ログイン</h1>
          <p className="mt-2 text-sm text-slate-500">
            毎日1〜2分で、ステートメントと行動目標を記録します
          </p>
        </div>

        {error === "invalid" && (
          <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
            メールアドレスまたはパスワードが正しくありません。
          </p>
        )}
        {error === "session" && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            ログイン情報が古くなりました。再度ログインしてください。
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <Input
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
          />
          <Input
            label="パスワード"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
          <Button type="submit" className="w-full py-3.5 text-base font-semibold">
            ログイン
          </Button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          <p className="font-medium text-slate-800">デモアカウント</p>
          <p className="mt-2">オーナー: owner@demo.local / demo1234</p>
          <p>スタッフ: staff@demo.local / demo1234</p>
        </div>
      </Card>
    </div>
  );
}
