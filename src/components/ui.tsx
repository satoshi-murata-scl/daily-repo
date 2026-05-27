import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  children,
  sub,
}: {
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="mb-3 sm:mb-4">
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{children}</h2>
      {sub && <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">{sub}</p>}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary:
      "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 disabled:bg-slate-300",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-100",
    ghost: "bg-transparent text-teal-800 hover:bg-teal-50 active:bg-teal-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
  };

  return (
    <button
      className={`inline-flex min-h-[44px] touch-manipulation items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <input
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2 sm:py-2.5 sm:text-sm ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      <textarea
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none ring-teal-600/30 focus:border-teal-600 focus:ring-2 sm:py-2.5 sm:text-sm ${className}`}
        {...props}
      />
    </label>
  );
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
      Lv{level}
    </span>
  );
}

export function CheckboxRow({
  id,
  label,
  description,
  defaultChecked,
  name,
  badge,
  form,
}: {
  id: string;
  label: ReactNode;
  description?: string;
  defaultChecked?: boolean;
  name: string;
  badge?: ReactNode;
  form?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-[52px] cursor-pointer touch-manipulation gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition active:scale-[0.99] active:border-teal-200 active:bg-teal-50/50 has-[:checked]:border-teal-300 has-[:checked]:bg-teal-50/70"
    >
      <input
        id={id}
        name={name}
        form={form}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-6 w-6 shrink-0 rounded-md border-slate-300 text-teal-700 focus:ring-teal-600 focus:ring-offset-0"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-start gap-2">
          <span className="block text-[15px] font-medium leading-snug text-slate-900">
            {label}
          </span>
          {badge}
        </span>
        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-slate-500">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          {value}/{max}日
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-teal-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
