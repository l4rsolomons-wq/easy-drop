import { jsx as _jsx, jsxs as _jsxs } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { useMemo } from "https://esm.sh/react@19.2.6";
import { HUB, SUBURBS } from "./../data/seed.js";
import { cn } from "./../utils/cn.js";
import { Icon } from "./Icon.js";
/**
 * Simulated Gauteng operating map. Pure SVG — no paid map API.
 * Coordinates are a 0–100 abstract space defined in data/seed.ts.
 */
export function FleetMap({ vehicles, routes, selectedVehicleId, onSelectVehicle, showRoutes = true, showZones = true, height = 420, focusPoint, className, }) {
    const zones = useMemo(() => {
        const byZone = new Map();
        SUBURBS.forEach((s) => {
            const arr = byZone.get(s.zone) ?? [];
            arr.push({ x: s.x, y: s.y });
            byZone.set(s.zone, arr);
        });
        return Array.from(byZone.entries()).map(([zone, pts]) => {
            const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
            const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
            const r = Math.max(9, ...pts.map((p) => Math.hypot(p.x - cx, p.y - cy) + 6));
            const colour = routes.find((rt) => rt.zone === zone)?.colour ?? "#2b5480";
            return { zone, cx, cy, r, colour };
        });
    }, [routes]);
    const active = vehicles.filter((v) => v.status === "On Route" || v.status === "Available");
    return (_jsxs("div", { className: cn("relative overflow-hidden rounded-lg border border-navy-800 bg-navy-950", className), style: { height }, children: [_jsxs("svg", { viewBox: "0 0 100 82", className: "grid-paper h-full w-full", role: "img", "aria-label": "Simulated live fleet map of Gauteng", children: [_jsxs("g", { stroke: "#1f3f63", strokeWidth: "1.1", fill: "none", strokeLinecap: "round", children: [_jsx("path", { d: "M92 2 C78 14, 66 26, 56 42 C50 52, 48 64, 46 80" }), _jsx("path", { d: "M4 40 C20 44, 36 50, 56 54 C72 57, 84 62, 96 72" }), _jsx("path", { d: "M10 72 C26 66, 40 62, 56 63 C70 64, 82 58, 94 46" }), _jsx("path", { d: "M40 4 C42 20, 44 34, 46 50" })] }), _jsxs("g", { fill: "#2b5480", fontSize: "1.9", fontWeight: "600", opacity: "0.85", children: [_jsx("text", { x: "88", y: "8", children: "N1" }), _jsx("text", { x: "6", y: "38", children: "N12" }), _jsx("text", { x: "12", y: "75", children: "M68" }), _jsx("text", { x: "41", y: "6", children: "M1" })] }), showZones &&
                        zones.map((z) => (_jsxs("g", { children: [_jsx("circle", { cx: z.cx, cy: z.cy, r: z.r, fill: z.colour, fillOpacity: "0.07", stroke: z.colour, strokeOpacity: "0.32", strokeWidth: "0.35", strokeDasharray: "1.6 1.2" }), _jsx("text", { x: z.cx, y: z.cy - z.r + 2.4, textAnchor: "middle", fontSize: "2.1", fontWeight: "700", fill: z.colour, opacity: "0.9", children: z.zone.toUpperCase() })] }, z.zone))), showRoutes &&
                        routes.map((r) => (_jsx("path", { d: r.path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" "), fill: "none", stroke: r.colour, strokeWidth: "0.55", strokeOpacity: "0.75", strokeDasharray: "2 1.4", strokeLinecap: "round" }, r.id))), SUBURBS.map((s) => (_jsxs("g", { children: [_jsx("circle", { cx: s.x, cy: s.y, r: "0.7", fill: "#93a4bb" }), _jsx("text", { x: s.x + 1.3, y: s.y + 0.8, fontSize: "1.8", fill: "#93a4bb", children: s.name })] }, s.name))), focusPoint && (_jsxs("g", { children: [_jsx("circle", { cx: focusPoint.x, cy: focusPoint.y, r: "2.2", fill: "#d97706", fillOpacity: "0.25" }), _jsx("circle", { cx: focusPoint.x, cy: focusPoint.y, r: "1.1", fill: "#d97706" }), _jsx("text", { x: focusPoint.x + 2, y: focusPoint.y - 1.6, fontSize: "2.1", fontWeight: "700", fill: "#fbbf24", children: focusPoint.label })] })), _jsxs("g", { children: [_jsx("rect", { x: HUB.x - 2.4, y: HUB.y - 2.4, width: "4.8", height: "4.8", rx: "1", fill: "#12a05c" }), _jsx("text", { x: HUB.x, y: HUB.y + 0.9, textAnchor: "middle", fontSize: "2.6", fontWeight: "800", fill: "#062e1c", children: "H" }), _jsx("text", { x: HUB.x, y: HUB.y + 5.4, textAnchor: "middle", fontSize: "2", fontWeight: "700", fill: "#63c795", children: "CITY DEEP HUB" })] }), active.map((v) => {
                        const selected = v.id === selectedVehicleId;
                        const colour = v.status === "On Route" ? "#63c795" : "#93a4bb";
                        return (_jsxs("g", { transform: `translate(${v.pos.x} ${v.pos.y})`, className: onSelectVehicle ? "cursor-pointer" : undefined, onClick: () => onSelectVehicle?.(v.id), role: onSelectVehicle ? "button" : undefined, "aria-label": `${v.id} ${v.status}`, children: [v.status === "On Route" && _jsx("circle", { r: "2.6", fill: colour, fillOpacity: "0.28", className: "pulse-ring" }), _jsx("circle", { r: selected ? "2.3" : "1.7", fill: colour, stroke: "#081120", strokeWidth: "0.4" }), _jsx("text", { y: "0.55", textAnchor: "middle", fontSize: "1.6", fontWeight: "800", fill: "#081120", children: v.id.slice(-2) }), _jsx("rect", { x: "2.4", y: "-1.9", width: v.id.length * 1.35 + 1.6, height: "3.2", rx: "0.6", fill: "#081120", fillOpacity: "0.72" }), _jsx("text", { x: "3.2", y: "0.35", fontSize: "1.9", fontWeight: "700", fill: "#e4e9f0", children: v.id })] }, v.id));
                    })] }), _jsxs("div", { className: "pointer-events-none absolute bottom-2 left-2 flex flex-wrap items-center gap-2 rounded-md bg-navy-950/85 px-2.5 py-1.5 text-[10.5px] font-medium text-mist-200 backdrop-blur", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-brand-300" }), " On route"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-full bg-mist-300" }), " At hub / available"] }), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "h-2 w-2 rounded-sm bg-brand-500" }), " Hub"] })] }), _jsxs("div", { className: "pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded border border-white/15 bg-navy-950/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-300 backdrop-blur", children: [_jsx(Icon, { name: "signal", className: "h-3 w-3" }), "Simulated telematics"] })] }));
}
