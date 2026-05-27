import { StaffBottomNav } from "@/components/staff/staff-bottom-nav";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStaff();
  const store = await prisma.store.findUnique({
    where: { id: session.storeId },
    select: { pdfUrl: true },
  });

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-slate-50 to-teal-50/30">
      <main
        className="mx-auto w-full max-w-lg flex-1 px-4 pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] pt-1"
        id="staff-main"
      >
        {children}
      </main>
      <StaffBottomNav pdfUrl={store?.pdfUrl} />
    </div>
  );
}
