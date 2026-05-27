type DailySaveHabitNoticeProps = {
  variant?: "default" | "compact";
};

/** 行動指針ができなくても毎日保存する習慣の案内 */
export function DailySaveHabitNotice({
  variant = "default",
}: DailySaveHabitNoticeProps) {
  if (variant === "compact") {
    return (
      <p className="text-[11px] leading-relaxed text-slate-600">
        行動指針ができなくても、その日は必ず保存しましょう。記録した日が振り返りの土台になります。
      </p>
    );
  }

  return (
    <div
      className="rounded-xl border border-sky-200 bg-sky-50/90 px-3.5 py-3 text-sm text-sky-950"
      role="note"
    >
      <p className="font-semibold text-sky-900">毎日、必ず保存する習慣を</p>
      <p className="mt-1.5 text-xs leading-relaxed text-sky-900/90">
        行動指針ができなくても、その日の業務を終えたらデイレポを保存しましょう。チェックは「できた日」だけ付ければ大丈夫です。できなかった日も残すことで、入力率や振り返りが正しく積み上がります。
      </p>
    </div>
  );
}
