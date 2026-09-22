import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { useId } from "https://esm.sh/react@19.2.6";
import { cn } from "./../utils/cn.js";
const COLOURS = ["#12a05c", "#2b5480", "#d97706", "#7c3aed", "#0891b2", "#dc2626", "#0a663b", "#64748b"];
/* ------------------------------ Bars ------------------------------- */
export function BarChart({ data, height = 180, colour = "#12a05c", valueFormat = (v) => String(Math.round(v)), compare, compareColour = "#dc2626", className, }) {
    const max = Math.max(1, ...data.map((d) => d.value), ...(compare ?? []));
    return (_jsxs("div", { className: cn("w-full", className), children: [_jsx("div", { className: "flex items-end gap-1", style: { height }, children: data.map((d, i) => (_jsxs("div", { className: "group flex h-full flex-1 flex-col items-center justify-end gap-0.5", children: [_jsx("span", { className: "num pointer-events-none text-[10px] font-semibold text-charcoal-500 opacity-0 transition-opacity group-hover:opacity-100", children: valueFormat(d.value) }), _jsxs("div", { className: "flex w-full items-end justify-center gap-[2px]", children: [_jsx("div", { className: "w-full rounded-t transition-all", style: { height: Math.max(2, (d.value / max) * (height - 22)), background: colour }, title: `${d.label}: ${valueFormat(d.value)}` }), compare && (_jsx("div", { className: "w-full rounded-t opacity-80", style: { height: Math.max(2, (compare[i] / max) * (height - 22)), background: compareColour }, title: `${d.label}: ${valueFormat(compare[i])}` }))] })] }, d.label + i))) }), _jsx("div", { className: "mt-1.5 flex gap-1 border-t border-mist-200 pt-1", children: data.map((d, i) => (_jsx("span", { className: "flex-1 truncate text-center text-[9.5px] text-charcoal-400", children: d.label }, d.label + i))) })] }));
}
/* ------------------------------ Line ------------------------------- */
export function LineChart({ data, height = 180, colour = "#12a05c", target, targetLabel, yMin, yMax, valueFormat = (v) => String(Math.round(v)), className, }) {
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
    return (_jsxs("div", { className: cn("w-full", className), children: [_jsxs("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", style: { height }, className: "w-full", role: "img", "aria-label": "Trend chart", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: `g${gid}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: colour, stopOpacity: "0.22" }), _jsx("stop", { offset: "100%", stopColor: colour, stopOpacity: "0" })] }) }), [0, 25, 50, 75, 100].map((y) => (_jsx("line", { x1: "0", y1: y, x2: "100", y2: y, stroke: "#e4e9f0", strokeWidth: "0.4", vectorEffect: "non-scaling-stroke" }, y))), targetY !== null && (_jsx("line", { x1: "0", y1: targetY, x2: "100", y2: targetY, stroke: "#d97706", strokeWidth: "1", strokeDasharray: "3 2", vectorEffect: "non-scaling-stroke" })), _jsx("path", { d: area, fill: `url(#g${gid})` }), _jsx("path", { d: path, fill: "none", stroke: colour, strokeWidth: "2", vectorEffect: "non-scaling-stroke", strokeLinejoin: "round", strokeLinecap: "round" }), pts.map((p, i) => (_jsx("circle", { cx: p.x, cy: p.y, r: "1.4", fill: colour, vectorEffect: "non-scaling-stroke", children: _jsx("title", { children: `${data[i].label}: ${valueFormat(data[i].value)}` }) }, i)))] }), _jsxs("div", { className: "mt-1 flex justify-between text-[10px] text-charcoal-400", children: [_jsx("span", { children: data[0]?.label }), targetLabel && _jsx("span", { className: "font-semibold text-amber-700", children: targetLabel }), _jsx("span", { children: data[data.length - 1]?.label })] })] }));
}
/* ------------------------------ Donut ------------------------------ */
export function Donut({ segments, size = 148, centreLabel, centreValue, thickness = 16, }) {
    const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: "img", "aria-label": "Breakdown chart", children: [_jsxs("g", { transform: `rotate(-90 ${size / 2} ${size / 2})`, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "#f1f4f8", strokeWidth: thickness }), segments.map((s, i) => {
                                const len = (s.value / total) * c;
                                const el = (_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: s.colour ?? COLOURS[i % COLOURS.length], strokeWidth: thickness, strokeDasharray: `${len} ${c - len}`, strokeDashoffset: -offset, children: _jsx("title", { children: `${s.label}: ${s.value}` }) }, s.label));
                                offset += len;
                                return el;
                            })] }), (centreValue || centreLabel) && (_jsxs(_Fragment, { children: [_jsx("text", { x: "50%", y: "47%", textAnchor: "middle", className: "num", fontSize: size * 0.17, fontWeight: "700", fill: "#081120", children: centreValue }), _jsx("text", { x: "50%", y: "62%", textAnchor: "middle", fontSize: size * 0.085, fill: "#6b7686", children: centreLabel })] }))] }), _jsx("ul", { className: "min-w-[130px] flex-1 space-y-1.5", children: segments.map((s, i) => (_jsxs("li", { className: "flex items-center justify-between gap-2 text-[12.5px]", children: [_jsxs("span", { className: "flex min-w-0 items-center gap-2 text-charcoal-500", children: [_jsx("span", { className: "h-2.5 w-2.5 shrink-0 rounded-sm", style: { background: s.colour ?? COLOURS[i % COLOURS.length] } }), _jsx("span", { className: "truncate", children: s.label })] }), _jsx("span", { className: "num font-semibold text-navy-950", children: s.value })] }, s.label))) })] }));
}
/* --------------------------- Horizontal bars ------------------------ */
export function HBars({ data, valueFormat = (v) => String(Math.round(v)), colour = "#2b5480", onRowClick, }) {
    const max = Math.max(1, ...data.map((d) => d.value));
    return (_jsx("ul", { className: "space-y-2.5", children: data.map((d) => (_jsx("li", { children: _jsxs("button", { type: "button", disabled: !onRowClick, onClick: () => onRowClick?.(d.label), className: cn("w-full text-left", onRowClick && "cursor-pointer"), children: [_jsxs("div", { className: "mb-1 flex items-baseline justify-between gap-3 text-[12.5px]", children: [_jsx("span", { className: "truncate font-medium text-charcoal-700", children: d.label }), _jsx("span", { className: "num shrink-0 font-semibold text-navy-950", children: valueFormat(d.value) })] }), _jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-mist-100", children: _jsx("div", { className: "h-full rounded-full", style: { width: `${(d.value / max) * 100}%`, background: d.colour ?? colour } }) }), d.sub && _jsx("p", { className: "mt-0.5 text-[11px] text-charcoal-400", children: d.sub })] }) }, d.label))) }));
}
/* ---------------------------- Sparkline ----------------------------- */
export function Sparkline({ values, colour = "#12a05c", width = 96, height = 28 }) {
    if (!values.length)
        return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(0.001, max - min);
    const d = values
        .map((v, i) => `${i === 0 ? "M" : "L"}${(i / (values.length - 1)) * width},${height - ((v - min) / span) * height}`)
        .join(" ");
    return (_jsx("svg", { width: width, height: height, viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true", children: _jsx("path", { d: d, fill: "none", stroke: colour, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
/* --------------------------- Stacked bars --------------------------- */
export function StackedBar({ parts, height = 10 }) {
    const total = Math.max(1, parts.reduce((s, p) => s + p.value, 0));
    return (_jsxs("div", { children: [_jsx("div", { className: "flex w-full overflow-hidden rounded-full bg-mist-100", style: { height }, children: parts.map((p) => (_jsx("div", { style: { width: `${(p.value / total) * 100}%`, background: p.colour }, title: `${p.label}: ${p.value}` }, p.label))) }), _jsx("ul", { className: "mt-2 flex flex-wrap gap-x-4 gap-y-1", children: parts.map((p) => (_jsxs("li", { className: "flex items-center gap-1.5 text-[11.5px] text-charcoal-500", children: [_jsx("span", { className: "h-2 w-2 rounded-sm", style: { background: p.colour } }), p.label, " ", _jsx("span", { className: "num font-semibold text-navy-950", children: p.value })] }, p.label))) })] }));
}
