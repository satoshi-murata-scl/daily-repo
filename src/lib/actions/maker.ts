"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createMakerSession,
  destroyMakerSession,
  requireMakerSession,
  verifyMakerPassword,
} from "@/lib/maker-auth";
import { setStaffCreatedFlash } from "@/lib/staff-created-flash";
import { createStaffMember } from "@/lib/staff-provision";
import { parseJobTitleValue } from "@/lib/job-title";
import { countStoreStaff } from "@/lib/staff-quota";

const MAKER_RESET_FLASH = "maker_reset_flash";

function resolveAppBaseUrl(): string {
  const explicit = process.env.APP_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railwayDomain) return `https://${railwayDomain}`;

  return "http://localhost:3000";
}

async function allocateStoreCode(): Promise<string> {
  const existing = await prisma.store.findMany({ select: { storeCode: true } });
  const used = new Set(existing.map((s) => s.storeCode));

  for (let n = 1; n <= 9999; n++) {
    const code = `STORE${String(n).padStart(3, "0")}`;
    if (!used.has(code)) return code;
  }

  throw new Error("店舗コードを割り当てられませんでした");
}

export async function createStoreByMakerAction(formData: FormData) {
  await requireMakerSession();

  const storeName = String(formData.get("storeName") ?? "").trim();
  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const ownerPassword = String(formData.get("ownerPassword") ?? "");

  if (!storeName || !ownerEmail || ownerPassword.length < 6) {
    redirect("/maker?error=invalid");
  }

  const emailTaken = await prisma.staff.findUnique({ where: { email: ownerEmail } });
  if (emailTaken) {
    redirect("/maker?error=exists");
  }

  const storeCode = await allocateStoreCode();
  const ownerName = `${storeName} オーナー`;

  const store = await prisma.store.create({
    data: {
      storeCode,
      name: storeName,
      appBaseUrl: resolveAppBaseUrl(),
      maxStaff: 10,
    },
  });

  await prisma.staff.create({
    data: {
      email: ownerEmail,
      name: ownerName,
      passwordHash: await hashPassword(ownerPassword),
      role: "OWNER",
      storeId: store.id,
    },
  });

  await setStaffCreatedFlash({
    email: ownerEmail,
    password: ownerPassword,
    name: ownerName,
  });

  revalidatePath("/maker");
  revalidatePath("/login");
  revalidatePath("/owner");
  redirect(`/maker?store=${storeCode}&store_created=1`);
}

export async function makerLoginAction(formData: FormData) {
  const secret = String(formData.get("secret") ?? "").trim();

  if (!process.env.MAKER_SECRET?.trim()) {
    redirect("/maker/login?error=not_configured");
  }

  if (!verifyMakerPassword(secret)) {
    redirect("/maker/login?error=invalid");
  }

  await createMakerSession();
  redirect("/maker");
}

export async function makerLogoutAction() {
  await destroyMakerSession();
  redirect("/maker/login");
}

export async function updateMaxStaffAction(formData: FormData) {
  await requireMakerSession();
  const storeId = String(formData.get("storeId") ?? "");
  const maxStaff = Number(formData.get("maxStaff"));

  if (!storeId || maxStaff < 1 || maxStaff > 500) {
    redirect("/maker?error=invalid");
  }

  const current = await countStoreStaff(storeId);
  if (maxStaff < current) {
    redirect(`/maker?store=${formData.get("storeCode")}&error=below_current`);
  }

  await prisma.store.update({
    where: { id: storeId },
    data: { maxStaff },
  });

  revalidatePath("/maker");
  revalidatePath("/owner/staff");
  redirect(`/maker?store=${formData.get("storeCode")}&saved=1`);
}

export async function createStaffByMakerAction(formData: FormData) {
  await requireMakerSession();

  const storeId = String(formData.get("storeId") ?? "");
  const storeCode = String(formData.get("storeCode") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!storeId || !email || !name || password.length < 6) {
    redirect(`/maker?store=${storeCode}&error=invalid`);
  }

  const jobTitle = parseJobTitleValue(String(formData.get("jobTitle") ?? ""));
  const result = await createStaffMember(storeId, { email, name, password, jobTitle });
  if (!result.ok) {
    redirect(`/maker?store=${storeCode}&error=${result.reason}`);
  }

  await setStaffCreatedFlash({ email, password, name });

  revalidatePath("/maker");
  revalidatePath("/owner/staff");
  redirect(`/maker?store=${storeCode}&created=1`);
}

export async function resetStaffPasswordAction(formData: FormData) {
  await requireMakerSession();

  const staffId = String(formData.get("staffId") ?? "");
  const storeCode = String(formData.get("storeCode") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!staffId || password.length < 6) {
    redirect(`/maker?store=${storeCode}&error=invalid`);
  }

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, role: "STAFF" },
  });
  if (!staff) redirect(`/maker?store=${storeCode}&error=staff`);

  await prisma.staff.update({
    where: { id: staffId },
    data: { passwordHash: await hashPassword(password) },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    MAKER_RESET_FLASH,
    JSON.stringify({ email: staff.email, password, name: staff.name, reset: true }),
    { httpOnly: true, maxAge: 120, path: "/" },
  );

  redirect(`/maker?store=${storeCode}&reset=1`);
}

/** Server Component 用（削除は /api/flash/clear で行う） */
export async function readMakerFlash(): Promise<{
  email: string;
  password: string;
  name: string;
  reset?: boolean;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MAKER_RESET_FLASH)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as {
      email: string;
      password: string;
      name: string;
      reset?: boolean;
    };
  } catch {
    return null;
  }
}
