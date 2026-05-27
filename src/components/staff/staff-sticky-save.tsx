type StaffStickySaveProps = {
  formId: string;
  label?: string;
  hint?: string;
  saved?: boolean;
};

export function StaffStickySave({
  formId,
  label = "保存する",
  hint = "チェックだけでは記録されません",
  saved,
}: StaffStickySaveProps) {
  return (
    <div
      className="fixed left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md safe-x"
      style={{
        bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="mx-auto max-w-lg">
        {saved && (
          <p className="mb-2 text-center text-xs text-amber-800">
            本日分は保存済みです
          </p>
        )}
        <button
          type="submit"
          form={formId}
          className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-2xl bg-teal-700 text-base font-semibold text-white shadow-md transition active:scale-[0.98] active:bg-teal-800"
        >
          {label}
        </button>
        {hint && (
          <p className="mt-2 text-center text-[11px] leading-snug text-slate-500">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
