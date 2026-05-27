import { JOB_TITLE_OPTIONS } from "@/lib/job-title";
import type { JobTitle } from "@/generated/prisma/client";

export function JobTitleSelect({
  name = "jobTitle",
  defaultValue = "STYLIST",
  label = "役職",
}: {
  name?: string;
  defaultValue?: JobTitle;
  label?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2 sm:py-2.5 sm:text-sm"
      >
        {JOB_TITLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
