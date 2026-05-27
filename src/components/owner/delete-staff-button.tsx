"use client";

import { deleteStaffAction } from "@/lib/actions/owner";
import { Button } from "@/components/ui";

export function DeleteStaffButton({
  staffId,
  staffName,
}: {
  staffId: string;
  staffName: string;
}) {
  return (
    <form
      action={deleteStaffAction}
      onSubmit={(e) => {
        const ok = confirm(
          `「${staffName}」のアカウントを削除しますか？\nデイレポ・行動指針・面談メモなどのデータもすべて削除され、元に戻せません。`,
        );
        if (!ok) e.preventDefault();
      }}
    >
      <input type="hidden" name="staffId" value={staffId} />
      <Button
        type="submit"
        variant="danger"
        className="min-w-[5.5rem] border border-rose-700 shadow-sm"
      >
        削除
      </Button>
    </form>
  );
}
