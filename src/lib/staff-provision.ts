import type { JobTitle } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreStaffQuota } from "@/lib/staff-quota";

export type CreateStaffResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "quota" | "exists" | "store" };

export async function createStaffMember(
  storeId: string,
  input: { email: string; name: string; password: string; jobTitle?: JobTitle },
): Promise<CreateStaffResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;

  if (!email || !name || password.length < 6) {
    return { ok: false, reason: "invalid" };
  }

  const quota = await getStoreStaffQuota(storeId);
  if (!quota) return { ok: false, reason: "store" };
  if (!quota.canAdd) return { ok: false, reason: "quota" };

  const exists = await prisma.staff.findUnique({ where: { email } });
  if (exists) return { ok: false, reason: "exists" };

  await prisma.staff.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
      role: "STAFF",
      storeId,
      jobTitle: input.jobTitle ?? "STYLIST",
    },
  });

  return { ok: true };
}
