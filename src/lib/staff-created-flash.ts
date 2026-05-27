import { cookies } from "next/headers";

const FLASH_COOKIE = "staff_created_flash";

export type StaffCreatedFlash = {
  email: string;
  password: string;
  name: string;
};

export async function setStaffCreatedFlash(data: StaffCreatedFlash) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    maxAge: 120,
    path: "/",
  });
}

/** Server Component 用（削除は /api/flash/clear で行う） */
export async function readStaffCreatedFlash(): Promise<StaffCreatedFlash | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StaffCreatedFlash;
  } catch {
    return null;
  }
}
