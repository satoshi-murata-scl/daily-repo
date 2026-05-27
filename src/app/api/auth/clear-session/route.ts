import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const COOKIE_NAME = "daily_repo_session";

/** 無効セッションの Cookie 削除（Server Component では cookies().delete 不可のため Route Handler で実行） */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error)}`);
  }
  redirect("/login");
}
