import { useMemo } from "react";
import { HUB, SUBURBS } from "@/data/seed";
import type { DeliveryRoute, Vehicle } from "@/types";
import { cn } from "@/utils/cn";
import { Icon } from "@/components/Icon";

/**
 * Simulated Gauteng operating map. Pure SVG — no paid map API.
 * Coordinates are a 0–100 abstract space defined in data/seed.ts.
 */
export function FleetMap({
  vehicles,
  routes,
  selectedVehicleId,
  onSelectVehicle,
  showRoutes = true,
  showZones = true,
  height = 420,
  focusPoint,
  className,
}: {
  vehicles: Vehicle[];
  routes: DeliveryRoute[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string) => void;
  showRoutes?: boolean;
  showZones?: boolean;
  height?: number;
  focusPoint?: { x: number; y: number; label: string } | null;
  className?: string;
}) {
  const zones = useMemo(() => {
    const byZone = new Map<string, { x: number; y: number }[]>();
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

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-navy-800 bg-navy-950", className)} style={{ height }}>
      <svg viewBox="0 0 100 82" className="grid-paper h-full w-full" role="img" aria-label="Simulated live fleet map of Gauteng">
        {/* highways */}
        <g stroke="#1f3f63" strokeWidth="1.1" fill="none" strokeLinecap="round">
          <path d="M92 2 C78 14, 66 26, 56 42 C50 52, 48 64, 46 80" />
          <path d="M4 40 C20 44, 36 50, 56 54 C72 57, 84 62, 96 72" />
          <path d="M10 72 C26 66, 40 62, 56 63 C70 64, 82 58, 94 46" />
          <path d="M40 4 C42 20, 44 34, 46 50" />
        </g>
        <g fill="#2b5480" fontSize="1.9" fontWeight="600" opacity="0.85">
          <text x="88" y="8">N1</text>
          <text x="6" y="38">N12</text>
          <text x="12" y="75">M68</text>
          <text x="41" y="6">M1</text>
        </g>

        {/* delivery zones */}
        {showZones &&
          zones.map((z) => (
            <g key={z.zone}>
              <circle cx={z.cx} cy={z.cy} r={z.r} fill={z.colour} fillOpacity="0.07" stroke={z.colour} strokeOpacity="0.32" strokeWidth="0.35" strokeDasharray="1.6 1.2" />
              <text x={z.cx} y={z.cy - z.r + 2.4} textAnchor="middle" fontSize="2.1" fontWeight="700" fill={z.colour} opacity="0.9">
                {z.zone.toUpperCase()}
              </text>
            </g>
          ))}

        {/* route paths */}
        {showRoutes &&
          routes.map((r) => (
            <path
              key={r.id}
              d={r.path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={r.colour}
              strokeWidth="0.55"
              strokeOpacity="0.75"
              strokeDasharray="2 1.4"
              strokeLinecap="round"
            />
          ))}

        {/* suburb dots */}
        {SUBURBS.map((s) => (
          <g key={s.name}>
            <circle cx={s.x} cy={s.y} r="0.7" fill="#93a4bb" />
            <text x={s.x + 1.3} y={s.y + 0.8} fontSize="1.8" fill="#93a4bb">
              {s.name}
            </text>
          </g>
        ))}

        {/* focus point (e.g. a delivery destination) */}
        {focusPoint && (
          <g>
            <circle cx={focusPoint.x} cy={focusPoint.y} r="2.2" fill="#d97706" fillOpacity="0.25" />
            <circle cx={focusPoint.x} cy={focusPoint.y} r="1.1" fill="#d97706" />
            <text x={focusPoint.x + 2} y={focusPoint.y - 1.6} fontSize="2.1" fontWeight="700" fill="#fbbf24">
              {focusPoint.label}
            </text>
          </g>
        )}

        {/* hub */}
        <g>
          <rect x={HUB.x - 2.4} y={HUB.y - 2.4} width="4.8" height="4.8" rx="1" fill="#12a05c" />
          <text x={HUB.x} y={HUB.y + 0.9} textAnchor="middle" fontSize="2.6" fontWeight="800" fill="#062e1c">
            H
          </text>
          <text x={HUB.x} y={HUB.y + 5.4} textAnchor="middle" fontSize="2" fontWeight="700" fill="#63c795">
            CITY DEEP HUB
          </text>
        </g>

        {/* vehicles */}
        {active.map((v) => {
          const selected = v.id === selectedVehicleId;
          const colour = v.status === "On Route" ? "#63c795" : "#93a4bb";
          return (
            <g
              key={v.id}
              transform={`translate(${v.pos.x} ${v.pos.y})`}
              className={onSelectVehicle ? "cursor-pointer" : undefined}
              onClick={() => onSelectVehicle?.(v.id)}
              role={onSelectVehicle ? "button" : undefined}
              aria-label={`${v.id} ${v.status}`}
            >
              {v.status === "On Route" && <circle r="2.6" fill={colour} fillOpacity="0.28" className="pulse-ring" />}
              <circle r={selected ? "2.3" : "1.7"} fill={colour} stroke="#081120" strokeWidth="0.4" />
              <text y="0.55" textAnchor="middle" fontSize="1.6" fontWeight="800" fill="#081120">
                {v.id.slice(-2)}
              </text>
              <rect x="2.4" y="-1.9" width={v.id.length * 1.35 + 1.6} height="3.2" rx="0.6" fill="#081120" fillOpacity="0.72" />
              <text x="3.2" y="0.35" fontSize="1.9" fontWeight="700" fill="#e4e9f0">
                {v.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap items-center gap-2 rounded-md bg-navy-950/85 px-2.5 py-1.5 text-[10.5px] font-medium text-mist-200 backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-300" /> On route
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-mist-300" /> At hub / available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-brand-500" /> Hub
        </span>
      </div>
      <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded border border-white/15 bg-navy-950/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-300 backdrop-blur">
        <Icon name="signal" className="h-3 w-3" />
        Simulated telematics
      </div>
    </div>
  );
}
