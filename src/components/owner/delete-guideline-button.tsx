"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui";

export function DeleteGuidelineButton({
  action,
  children,
  confirmMessage = "この指針を削除しますか？",
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      className="mt-2"
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
      <Button type="submit" variant="ghost" className="text-rose-600">
        削除
      </Button>
    </form>
  );
}
