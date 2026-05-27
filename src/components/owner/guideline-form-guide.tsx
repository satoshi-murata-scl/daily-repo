export function GuidelineFormGuide({ variant }: { variant: "list" | "add" }) {
  if (variant === "add") {
    return (
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">追加するとき</p>
        <p className="mt-2 text-slate-600">
          <strong>指針の内容</strong> … スタッフに読んでもらう一文を入力してください。
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-slate-700">
      <p className="font-medium text-teal-900">各行の入力欄</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
        <li>
          <strong>左（広い欄）</strong> … 指針の文
        </li>
        <li>
          文を変えたら <strong>更新</strong> を押す
        </li>
        <li>
          <strong>削除</strong> … 一覧から取り除き、スタッフ画面にも表示されなくなります
        </li>
      </ul>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        スタッフ画面では毎日1件だけ「今日のひとつ」として大きく表示され、ほかは「ほか N
        件を見る」から確認できます。同じ日は同じ1件が選ばれます。
      </p>
    </div>
  );
}
