import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Icon, type IconName } from "@/components/Icon";

/* ----------------------------- Buttons ----------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "warning";
type Size = "xs" | "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 border border-brand-600/20 shadow-sm",
  secondary: "bg-white text-charcoal-900 border border-mist-300 hover:bg-mist-50 shadow-sm",
  ghost: "bg-transparent text-charcoal-500 hover:bg-mist-200 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-red-700/20 shadow-sm",
  warning: "bg-amber-500 text-white hover:bg-amber-600 border border-amber-600/20 shadow-sm",
  dark: "bg-navy-950 text-white hover:bg-navy-800 border border-navy-800 shadow-sm",
};
const SIZES: Record<Size, string> = {
  xs: "h-7 px-2.5 text-[12px] gap-1",
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: { variant?: Variant; size?: Size; icon?: IconName | string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} className={size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4"} />}
      {children}
    </button>
  );
}

/* ------------------------------ Cards ------------------------------ */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-lg border border-mist-200 bg-white shadow-[0_1px_2px_rgba(8,17,32,0.05)]", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: IconName | string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-mist-200 px-4 py-3", className)}>
      <div className="flex min-w-0 items-start gap-2.5">
        {icon && (
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-mist-100 text-navy-700">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-navy-950">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[12.5px] leading-snug text-charcoal-400">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}

/* ----------------------------- Badges ------------------------------ */

export type Tone = "neutral" | "success" | "warning" | "critical" | "info" | "navy";

const TONES: Record<Tone, string> = {
  neutral: "bg-mist-100 text-charcoal-500 border-mist-300",
  success: "bg-brand-50 text-brand-700 border-brand-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
  navy: "bg-navy-950/5 text-navy-800 border-navy-950/15",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-0.5 text-[11.5px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Domain status → tone + label. Never relies on colour alone: always shows text. */
export const statusTone = (status: string): Tone => {
  const s = status.toLowerCase();
  if (["delivered", "completed", "available", "pass", "valid", "in stock", "active", "closed", "on route"].includes(s))
    return s === "on route" || s === "active" ? "info" : "success";
  if (["pending", "scheduled", "assigned", "due", "maintenance", "low stock", "expiring soon", "under review", "planned", "delayed", "picked up", "dispatched", "in transit", "in progress", "off duty", "on leave"].includes(s))
    return ["picked up", "dispatched", "in transit", "in progress"].includes(s) ? "info" : "warning";
  if (["failed", "fail", "overdue", "expired", "out of stock", "out of service", "inspection required", "returned", "open", "critical", "suspended"].includes(s))
    return "critical";
  return "neutral";
};

export const StatusBadge = ({ status, className }: { status: string; className?: string }) => (
  <Badge tone={statusTone(status)} dot className={className}>
    {status}
  </Badge>
);

/* ------------------------------ Stats ------------------------------ */

export function Stat({
  label,
  value,
  sub,
  trend,
  tone = "neutral",
  icon,
  onClick,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  trend?: number;
  tone?: Tone;
  icon?: IconName | string;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  const accent =
    tone === "success" ? "text-brand-600" : tone === "warning" ? "text-amber-600" : tone === "critical" ? "text-red-600" : "text-navy-950";
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "rounded-lg border border-mist-200 bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(8,17,32,0.05)]",
        onClick && "transition-colors hover:border-brand-300 hover:bg-brand-50/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-charcoal-400">{label}</p>
        {icon && <Icon name={icon} className="h-4 w-4 shrink-0 text-charcoal-400" />}
      </div>
      <p className={cn("num mt-1.5 text-[26px] font-bold leading-none", accent)}>{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-charcoal-400">
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold",
              trend >= 0 ? "text-brand-600" : "text-red-600",
            )}
          >
            <Icon name={trend >= 0 ? "arrowUp" : "arrowDown"} className="h-3 w-3" />
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {sub && <span className="truncate">{sub}</span>}
      </div>
    </Wrapper>
  );
}

/* ------------------------------ Forms ------------------------------ */

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 flex items-center gap-1 text-[12.5px] font-semibold text-charcoal-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-charcoal-400">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-md border border-mist-300 bg-white px-3 py-2 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25";

export const Input = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputBase, className)} {...rest} />
);

export const Textarea = ({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(inputBase, "min-h-[76px] resize-y", className)} {...rest} />
);

export function Select({
  className,
  options,
  ...rest
}: { options: { value: string; label: string; disabled?: boolean }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, "appearance-none bg-[right_0.6rem_center] pr-8", className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div>
        <p className="text-[13.5px] font-semibold text-charcoal-900">{label}</p>
        {description && <p className="text-[12px] text-charcoal-400">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-brand-600 bg-brand-500" : "border-mist-300 bg-mist-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-all",
            checked ? "left-[1.45rem]" : "left-0.5",
          )}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  );
}

/* ------------------------------ Tabs ------------------------------- */

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (k: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("scroll-thin flex gap-1 overflow-x-auto border-b border-mist-200", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-semibold transition-colors",
            active === t.key
              ? "border-brand-500 text-navy-950"
              : "border-transparent text-charcoal-400 hover:text-charcoal-700",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="num ml-1.5 rounded bg-mist-100 px-1.5 py-0.5 text-[11px] text-charcoal-500">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Modal ------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 cursor-default" aria-label="Close dialog" onClick={onClose} tabIndex={-1} />
      <div className={cn("anim-in relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl sm:rounded-lg", width)}>
        <header className="flex items-start justify-between gap-4 border-b border-mist-200 px-5 py-3.5">
          <div>
            <h2 className="text-[16px] font-semibold text-navy-950">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12.5px] text-charcoal-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-charcoal-400 hover:bg-mist-100 hover:text-charcoal-900">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-mist-200 bg-mist-50 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

/* ------------------------- Drawer (details) ------------------------ */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/40" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" aria-label="Close panel" onClick={onClose} tabIndex={-1} />
      <aside className="anim-in relative flex h-full w-full max-w-xl flex-col bg-mist-50 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-mist-200 bg-white px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-semibold text-navy-950">{title}</h2>
            {subtitle && <div className="mt-0.5 text-[12.5px] text-charcoal-400">{subtitle}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-charcoal-400 hover:bg-mist-100 hover:text-charcoal-900">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </header>
        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
        {footer && <footer className="flex flex-wrap items-center gap-2 border-t border-mist-200 bg-white px-5 py-3">{footer}</footer>}
      </aside>
    </div>
  );
}

/* ------------------------------ Table ------------------------------ */

export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("scroll-thin w-full overflow-x-auto", className)}>
      <table className="w-full min-w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  );
}

export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th scope="col" className={cn("whitespace-nowrap border-b border-mist-200 bg-mist-50 px-3 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-charcoal-400", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn("border-b border-mist-100 px-3 py-2.5 align-middle text-charcoal-700", className)}>{children}</td>
);

export function Row({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === "Enter" ? onClick() : undefined) : undefined}
      className={cn(onClick && "cursor-pointer hover:bg-brand-50/40 focus:bg-brand-50/60 focus:outline-none", className)}
    >
      {children}
    </tr>
  );
}

/* --------------------------- Misc pieces --------------------------- */

export function EmptyState({ icon = "search", title, message, action }: { icon?: IconName | string; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-mist-100 text-charcoal-400">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="text-[14px] font-semibold text-navy-950">{title}</p>
      {message && <p className="max-w-sm text-[13px] text-charcoal-400">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Progress({ value, tone = "success", className }: { value: number; tone?: Tone; className?: string }) {
  const bar = tone === "critical" ? "bg-red-500" : tone === "warning" ? "bg-amber-500" : tone === "info" ? "bg-sky-500" : "bg-brand-500";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-mist-200", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-mist-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[21px] font-bold tracking-tight text-navy-950 md:text-[24px]">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-[13.5px] leading-relaxed text-charcoal-500">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KeyValue({ items, cols = 2 }: { items: [string, ReactNode][]; cols?: 1 | 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-4 gap-y-3", cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2")}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[11.5px] font-semibold uppercase tracking-wide text-charcoal-400">{k}</dt>
          <dd className="mt-0.5 break-words text-[13.5px] font-medium text-charcoal-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Banner({
  tone = "info",
  title,
  children,
  icon = "info",
  action,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  icon?: IconName | string;
  action?: ReactNode;
}) {
  const map: Record<string, string> = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-brand-200 bg-brand-50 text-brand-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    critical: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-mist-200 bg-mist-50 text-charcoal-700",
    navy: "border-navy-800 bg-navy-950 text-white",
  };
  return (
    <div className={cn("flex flex-wrap items-start gap-3 rounded-md border px-3.5 py-2.5 text-[13px]", map[tone])}>
      <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
      {action}
    </div>
  );
}

export const SimTag = ({ label = "SIMULATED TELEMATICS", className }: { label?: string; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 rounded border border-navy-950/15 bg-navy-950/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-700", className)}>
    <Icon name="signal" className="h-3 w-3" />
    {label}
  </span>
);
