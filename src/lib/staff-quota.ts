import { prisma } from "@/lib/db";

export async function countStoreStaff(storeId: string): Promise<number> {
  return prisma.staff.count({
    where: { storeId, role: "STAFF" },
  });
}

export async function getStoreStaffQuota(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { maxStaff: true },
  });
  if (!store) return null;

  const current = await countStoreStaff(storeId);
  return {
    maxStaff: store.maxStaff,
    current,
    remaining: Math.max(0, store.maxStaff - current),
    canAdd: current < store.maxStaff,
  };
}
