import { cookies } from "next/headers";

const STAFF_CREATED_FLASH = "staff_created_flash";
const MAKER_RESET_FLASH = "maker_reset_flash";

/** Server Component では cookies().delete 不可のため、表示後にクライアントから呼ぶ */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_CREATED_FLASH);
  cookieStore.delete(MAKER_RESET_FLASH);
  return new Response(null, { status: 204 });
}
