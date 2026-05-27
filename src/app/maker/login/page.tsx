import { isMakerSecretConfigured, isMakerSession } from "@/lib/maker-auth";
import { makerLoginAction } from "@/lib/actions/maker";
import { redirect } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export default async function MakerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isMakerSession()) redirect("/maker");

  const { error } = await searchParams;
  const configured = isMakerSecretConfigured();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-bold text-slate-900">製作者プロビジョニング</h1>
        <p className="mt-2 text-sm text-slate-600">
          スタッフ枠の変更・アカウント作成はこちらから行います（オーナー画面では不可）。
        </p>

        {!configured && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            <strong>MAKER_SECRET が読み込まれていません。</strong>
            <br />
            プロジェクトの <code className="text-xs">.env</code> に{" "}
            <code className="text-xs">MAKER_SECRET=&quot;16文字以上の文字列&quot;</code>{" "}
            を設定し、<strong>開発サーバーを再起動</strong>してください。
          </p>
        )}

        {configured && process.env.NODE_ENV === "development" && (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-2.5 text-xs leading-relaxed text-slate-600">
            入力するのは環境変数の<strong>値</strong>です（変数名の{" "}
            <code>MAKER_SECRET</code> という文字列ではありません）。
            <br />
            デモ例: <code>dev-maker-secret-change-in-production</code>
          </p>
        )}

        {error === "invalid" && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
            パスワードが正しくありません。.env に設定した文字列をそのまま入力してください。
          </p>
        )}

        {error === "not_configured" && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
            サーバー側の設定がありません。MAKER_SECRET を設定して再起動してください。
          </p>
        )}

        <form action={makerLoginAction} className="mt-6 space-y-4">
          <Input
            label="製作者パスワード"
            name="secret"
            type="password"
            required
            autoComplete="current-password"
            disabled={!configured}
            placeholder=".env の MAKER_SECRET の値"
          />
          <Button type="submit" className="w-full" disabled={!configured}>
            ログイン
          </Button>
        </form>
      </Card>
    </div>
  );
}
