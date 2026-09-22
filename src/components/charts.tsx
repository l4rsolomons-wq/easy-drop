import { useId } from "react";
import { cn } from "@/utils/cn";

export interface Point {
  label: string;
  value: number;
}

const COLOURS = ["#12a05c", "#2b5480", "#d97706", "#7c3aed", "#0891b2", "#dc2626", "#0a663b", "#64748b"];

/* ------------------------------ Bars ------------------------------- */

export function BarChart({
  data,
  height = 180,
  colour = "#12a05c",
  valueFormat = (v: number) => String(Math.round(v)),
  compare,
  compareColour = "#dc2626",
  className,
}: {
  data: Point[];
  height?: number;
  colour?: string;
  valueFormat?: (v: number) => string;
  compare?: number[];
  compareColour?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value), ...(compare ?? []));
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label + i} className="group flex h-full flex-1 flex-col items-center justify-end gap-0.5">
            <span className="num pointer-events-none text-[10px] font-semibold text-charcoal-500 opacity-0 transition-opacity group-hover:opacity-100">
              {valueFormat(d.value)}
            </span>
            <div className="flex w-full items-end justify-center gap-[2px]">
              <div
                className="w-full rounded-t transition-all"
                style={{ height: Math.max(2, (d.value / max) * (height - 22)), background: colour }}
                title={`${d.label}: ${valueFormat(d.value)}`}
              />
              {compare && (
                <div
                  className="w-full rounded-t opacity-80"
                  style={{ height: Math.max(2, (compare[i] / max) * (height - 22)), background: compareColour }}
                  title={`${d.label}: ${valueFormat(compare[i])}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1 border-t border-mist-200 pt-1">
        {data.map((d, i) => (
          <span key={d.label + i} className="flex-1 truncate text-center text-[9.5px] text-charcoal-400">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Line ------------------------------- */

export function LineChart({
  data,
  height = 180,
  colour = "#12a05c",
  target,
  targetLabel,
  yMin,
  yMax,
  valueFormat = (v: number) => String(Math.round(v)),
  className,
}: {
  data: Point[];
  height?: number;
  colour?: string;
  target?: number;
  targetLabel?: string;
  yMin?: number;
  yMax?: number;
  valueFormat?: (v: number) => string;
  className?: string;
}) {
  const gid = useId().replace(/:/g, "");
  const values = data.map((d) => d.value);
  const min = yMin ?? Math.min(...values, target ?? Infinity) * 0.96;
  const max = yMax ?? Math.max(...values, target ?? -Infinity) * 1.04;
  const span = Math.max(0.001, max - min);
  const W = 100;
  const pts = data.map((d, i) => ({
    x: (i / Math.max(1, data.length - 1)) * W,
    y: 100 - ((d.value - min) / span) * 100,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = `${path} L100,100 L0,100 Z`;
  const targetY = target !== undefined ? 100 - ((target - min) / span) * 100 : null;

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} className="w-full" role="img" aria-label="Trend chart">
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colour} stopOpacity="0.22" />
            <stop offset="100%" stopColor={colour} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e4e9f0" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        ))}
        {targetY !== null && (
          <line x1="0" y1={targetY} x2="100" y2={targetY} stroke="#d97706" strokeWidth="1" strokeDasharray="3 2" vectorEffect="non-scaling-stroke" />
        )}
        <path d={area} fill={`url(#g${gid})`} />
        <path d={path} fill="none" stroke={colour} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.4" fill={colour} vectorEffect="non-scaling-stroke">
            <title>{`${data[i].label}: ${valueFormat(data[i].value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-charcoal-400">
        <span>{data[0]?.label}</span>
        {targetLabel && <span className="font-semibold text-amber-700">{targetLabel}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

/* ------------------------------ Donut ------------------------------ */

export function Donut({
  segments,
  size = 148,
  centreLabel,
  centreValue,
  thickness = 16,
}: {
  segments: { label: string; value: number; colour?: string }[];
  size?: number;
  centreLabel?: string;
  centreValue?: string;
  thickness?: number;
}) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Breakdown chart">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f4f8" strokeWidth={thickness} />
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.colour ?? COLOURS[i % COLOURS.length]}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              >
                <title>{`${s.label}: ${s.value}`}</title>
              </circle>
            );
            offset += len;
            return el;
          })}
        </g>
        {(centreValue || centreLabel) && (
          <>
            <text x="50%" y="47%" textAnchor="middle" className="num" fontSize={size * 0.17} fontWeight="700" fill="#081120">
              {centreValue}
            </text>
            <text x="50%" y="62%" textAnchor="middle" fontSize={size * 0.085} fill="#6b7686">
              {centreLabel}
            </text>
          </>
        )}
      </svg>
      <ul className="min-w-[130px] flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span className="flex min-w-0 items-center gap-2 text-charcoal-500">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.colour ?? COLOURS[i % COLOURS.length] }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="num font-semibold text-navy-950">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------- Horizontal bars ------------------------ */

export function HBars({
  data,
  valueFormat = (v: number) => String(Math.round(v)),
  colour = "#2b5480",
  onRowClick,
}: {
  data: (Point & { colour?: string; sub?: string })[];
  valueFormat?: (v: number) => string;
  colour?: string;
  onRowClick?: (label: string) => void;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <button
            type="button"
            disabled={!onRowClick}
            onClick={() => onRowClick?.(d.label)}
            className={cn("w-full text-left", onRowClick && "cursor-pointer")}
          >
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[12.5px]">
              <span className="truncate font-medium text-charcoal-700">{d.label}</span>
              <span className="num shrink-0 font-semibold text-navy-950">{valueFormat(d.value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-mist-100">
              <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: d.colour ?? colour }} />
            </div>
            {d.sub && <p className="mt-0.5 text-[11px] text-charcoal-400">{d.sub}</p>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------- Sparkline ----------------------------- */

export function Sparkline({ values, colour = "#12a05c", width = 96, height = 28 }: { values: number[]; colour?: string; width?: number; height?: number }) {
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(0.001, max - min);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (values.length - 1)) * width},${height - ((v - min) / span) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={colour} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* --------------------------- Stacked bars --------------------------- */

export function StackedBar({ parts, height = 10 }: { parts: { label: string; value: number; colour: string }[]; height?: number }) {
  const total = Math.max(1, parts.reduce((s, p) => s + p.value, 0));
  return (
    <div>
      <div className="flex w-full overflow-hidden rounded-full bg-mist-100" style={{ height }}>
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.colour }} title={`${p.label}: ${p.value}`} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5 text-[11.5px] text-charcoal-500">
            <span className="h-2 w-2 rounded-sm" style={{ background: p.colour }} />
            {p.label} <span className="num font-semibold text-navy-950">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
