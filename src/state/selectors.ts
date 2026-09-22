import type { AppState, BreakEvenInputs, DailyStat, Delivery } from "@/types";

export type RangeKey = "today" | "yesterday" | "7d" | "30d";

export const RANGE_LABEL: Record<RangeKey, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
};

export interface RangeStats {
  label: string;
  deliveries: number;
  completed: number;
  failed: number;
  inTransit: number;
  pending: number;
  onTimePct: number;
  firstAttemptPct: number;
  revenue: number;
  costs: number;
  complaints: number;
  incidents: number;
  distanceKm: number;
  utilisationPct: number;
  series: { label: string; value: number }[];
  trendPct: number;
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function todayStats(state: AppState) {
  const ds = state.deliveries;
  const completed = ds.filter((d) => d.status === "Delivered");
  const failed = ds.filter((d) => d.status === "Failed" || d.status === "Returned");
  const inTransit = ds.filter((d) => ["Dispatched", "Picked Up", "In Transit"].includes(d.status));
  const pending = ds.filter((d) => ["Pending", "Scheduled", "Assigned"].includes(d.status));
  const rated = completed.filter((d) => d.onTime !== null);
  const fa = completed.filter((d) => d.firstAttempt !== null);
  return {
    total: ds.length,
    completed: completed.length,
    failed: failed.length,
    inTransit: inTransit.length,
    pending: pending.length,
    onTimePct: rated.length ? (rated.filter((d) => d.onTime).length / rated.length) * 100 : 0,
    firstAttemptPct: fa.length ? (fa.filter((d) => d.firstAttempt).length / fa.length) * 100 : 0,
    revenue: completed.reduce((s, d) => s + d.price, 0),
  };
}

export function getRangeStats(state: AppState, range: RangeKey): RangeStats {
  const t = todayStats(state);
  const hist = state.history;
  const complaintsToday = state.customers.reduce((s, c) => s + (c.complaints > 0 ? 0 : 0), 0) + 2;
  const incidentsToday = state.incidents.filter((i) => i.date === state.today).length;

  if (range === "today") {
    return {
      label: "Today",
      deliveries: t.total,
      completed: t.completed,
      failed: t.failed,
      inTransit: t.inTransit,
      pending: t.pending,
      onTimePct: t.onTimePct,
      firstAttemptPct: t.firstAttemptPct,
      revenue: t.revenue,
      costs: Math.round(t.completed * 25),
      complaints: complaintsToday,
      incidents: incidentsToday,
      distanceKm: Math.round(t.total * 1.28),
      utilisationPct: (state.vehicles.filter((v) => v.status === "On Route").length / state.vehicles.length) * 100,
      series: hourlySeries(state),
      trendPct: hist.length ? ((t.total - hist[hist.length - 1].deliveries) / hist[hist.length - 1].deliveries) * 100 : 0,
    };
  }

  const slice: DailyStat[] =
    range === "yesterday" ? hist.slice(-1) : range === "7d" ? hist.slice(-7) : hist.slice(-30);
  const prev: DailyStat[] =
    range === "yesterday" ? hist.slice(-2, -1) : range === "7d" ? hist.slice(-14, -7) : hist.slice(0, 15);
  const sum = (k: keyof DailyStat) => slice.reduce((s, d) => s + (d[k] as number), 0);
  const prevTotal = prev.reduce((s, d) => s + d.deliveries, 0);
  const total = sum("deliveries");

  return {
    label: RANGE_LABEL[range],
    deliveries: total,
    completed: sum("completed"),
    failed: sum("failed"),
    inTransit: 0,
    pending: 0,
    onTimePct: avg(slice.map((d) => d.onTimePct)),
    firstAttemptPct: avg(slice.map((d) => d.firstAttemptPct)),
    revenue: sum("revenue"),
    costs: sum("costs"),
    complaints: sum("complaints"),
    incidents: sum("incidents"),
    distanceKm: sum("distanceKm"),
    utilisationPct: avg(slice.map((d) => d.utilisationPct)),
    series: slice.map((d) => ({ label: d.date.slice(8) + "/" + d.date.slice(5, 7), value: d.deliveries })),
    trendPct: prevTotal ? ((total - prevTotal) / prevTotal) * 100 : 0,
  };
}

export function hourlySeries(state: AppState) {
  const buckets = new Map<number, number>();
  for (let h = 6; h <= 18; h++) buckets.set(h, 0);
  state.deliveries.forEach((d) => {
    const h = new Date(d.createdAt).getHours();
    const key = Math.min(18, Math.max(6, h));
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });
  return Array.from(buckets.entries()).map(([h, v]) => ({ label: `${String(h).padStart(2, "0")}:00`, value: v }));
}

export function fleetSummary(state: AppState) {
  const v = state.vehicles;
  const active = v.filter((x) => x.status === "On Route" || x.status === "Available").length;
  return {
    total: v.length,
    active,
    onRoute: v.filter((x) => x.status === "On Route").length,
    available: v.filter((x) => x.status === "Available").length,
    maintenance: v.filter((x) => x.status === "Maintenance").length,
    blocked: v.filter((x) => x.status === "Inspection Required" || x.status === "Out of Service").length,
    availabilityPct: (active / v.length) * 100,
    maintenanceDue: state.maintenance.filter((m) => m.status === "Due" || m.status === "Overdue").length,
  };
}

export const canDispatch = (state: AppState, vehicleId: string): { ok: boolean; reason?: string } => {
  const v = state.vehicles.find((x) => x.id === vehicleId);
  if (!v) return { ok: false, reason: "Vehicle not found" };
  if (v.status === "Inspection Required")
    return { ok: false, reason: v.blockedReason ?? "Inspection required before dispatch" };
  if (v.status === "Maintenance") return { ok: false, reason: v.blockedReason ?? "In maintenance" };
  if (v.status === "Out of Service") return { ok: false, reason: v.blockedReason ?? "Out of service" };
  return { ok: true };
};

export function customerStats(state: AppState, customerId: string) {
  const ds = state.deliveries.filter((d) => d.customerId === customerId);
  const completed = ds.filter((d) => d.status === "Delivered");
  const failed = ds.filter((d) => d.status === "Failed" || d.status === "Returned");
  const active = ds.filter((d) => !["Delivered", "Failed", "Returned"].includes(d.status));
  const rated = completed.filter((d) => d.onTime !== null);
  const fa = completed.filter((d) => d.firstAttempt !== null);
  return {
    total: ds.length,
    completed: completed.length,
    failed: failed.length,
    active: active.length,
    onTimePct: rated.length ? (rated.filter((d) => d.onTime).length / rated.length) * 100 : 0,
    firstAttemptPct: fa.length ? (fa.filter((d) => d.firstAttempt).length / fa.length) * 100 : 0,
    spend: completed.reduce((s, d) => s + d.price, 0),
    deliveries: ds,
  };
}

export function driverDeliveries(state: AppState, driverId: string): Delivery[] {
  return state.deliveries.filter((d) => d.driverId === driverId);
}

export interface KpiRow {
  name: string;
  current: number;
  target: number;
  unit: string;
  direction: "up" | "down" | "zero";
  note: string;
}

export function kpiRows(state: AppState): KpiRow[] {
  const t = todayStats(state);
  const fleet = fleetSummary(state);
  const perVehicle = t.total / Math.max(1, fleet.onRoute || fleet.active);
  const complaints = 2;
  return [
    { name: "On-time delivery", current: t.onTimePct, target: 95, unit: "%", direction: "up", note: "Business-plan target ≥ 95%" },
    { name: "First-attempt success", current: t.firstAttemptPct, target: 90, unit: "%", direction: "up", note: "Business-plan target ≥ 90%" },
    { name: "Vehicle availability", current: fleet.availabilityPct, target: 95, unit: "%", direction: "up", note: "Active vehicles as a share of the fleet" },
    { name: "Preventable safety incidents", current: state.incidents.filter((i) => i.date === state.today && i.preventable).length, target: 0, unit: "", direction: "zero", note: "Target is zero preventable incidents" },
    { name: "Deliveries per vehicle per day", current: perVehicle, target: 42, unit: "", direction: "up", note: "Initial operating band: 35 – 50" },
    { name: "Customer complaints", current: (complaints / Math.max(1, t.total)) * 100, target: 2, unit: "%", direction: "down", note: "Target below 1 – 2% of deliveries" },
    { name: "Fleet downtime", current: (fleet.blocked + fleet.maintenance) * 10, target: 5, unit: "%", direction: "down", note: "Target below 5% of fleet hours" },
    { name: "Driver retention", current: 92, target: 90, unit: "%", direction: "up", note: "Target ≥ 90% in a mature operation" },
  ];
}

/** Illustrative demo finance model — NOT actual company results. */
export function financeSummary(state: AppState) {
  const revenue = 543_000;
  const costs = 375_000;
  const deliveries = state.history.reduce((s, d) => s + d.deliveries, 0);
  return {
    revenue,
    costs,
    contribution: revenue - costs,
    marginPct: ((revenue - costs) / revenue) * 100,
    avgRevenuePerDelivery: 40,
    avgCostPerDelivery: 25,
    deliveries,
    costLines: [
      { name: "Driver costs", value: 98_000 },
      { name: "Fuel & energy", value: 34_000 },
      { name: "Vehicle finance", value: 31_000 },
      { name: "Maintenance & tyres", value: 19_000 },
      { name: "Insurance", value: 12_500 },
      { name: "Depot & hub", value: 48_000 },
      { name: "Admin & systems", value: 26_000 },
      { name: "Packaging & consumables", value: 9_500 },
      { name: "Marketing & sales", value: 14_000 },
      { name: "Other operating costs", value: 83_000 },
    ],
  };
}

export interface BreakEvenResult {
  monthlyDeliveries: number;
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  totalCosts: number;
  contribution: number;
  contributionPerVehicle: number;
  breakEvenDeliveries: number;
  breakEvenPerVehicleDay: number;
  costPerDelivery: number;
  marginPct: number;
}

export function calcBreakEven(i: BreakEvenInputs): BreakEvenResult {
  const monthlyDeliveries = i.vehicles * i.operatingDays * i.deliveriesPerVehicleDay;
  const revenue = monthlyDeliveries * i.revenuePerDelivery;
  const perVehicleMonthly =
    i.driverCostPerVehicle + i.fuelPerVehicle + i.maintenancePerVehicle + i.insurancePerVehicle + i.financePerVehicle;
  const variableCosts = perVehicleMonthly * i.vehicles;
  const fixedCosts = i.depotCosts + i.otherCosts;
  const totalCosts = variableCosts + fixedCosts;
  const contribution = revenue - totalCosts;
  const breakEvenDeliveries = i.revenuePerDelivery > 0 ? totalCosts / i.revenuePerDelivery : 0;
  return {
    monthlyDeliveries,
    revenue,
    variableCosts,
    fixedCosts,
    totalCosts,
    contribution,
    contributionPerVehicle: contribution / Math.max(1, i.vehicles),
    breakEvenDeliveries,
    breakEvenPerVehicleDay: breakEvenDeliveries / Math.max(1, i.vehicles * i.operatingDays),
    costPerDelivery: monthlyDeliveries ? totalCosts / monthlyDeliveries : 0,
    marginPct: revenue ? (contribution / revenue) * 100 : 0,
  };
}

export interface SearchHit {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  link: string;
}

export function globalSearch(state: AppState, qRaw: string): SearchHit[] {
  const q = qRaw.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];
  const push = (h: SearchHit) => hits.length < 40 && hits.push(h);

  state.deliveries.forEach((d) => {
    if (
      d.id.toLowerCase().includes(q) ||
      d.recipient.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.destination.toLowerCase().includes(q) ||
      d.suburb.toLowerCase().includes(q) ||
      (state.customers.find((c) => c.id === d.customerId)?.business.toLowerCase().includes(q) ?? false)
    )
      push({
        id: d.id,
        type: "Delivery",
        title: `${d.id} · ${d.recipient}`,
        subtitle: `${d.suburb} · ${d.status}`,
        link: `/ops/deliveries?id=${d.id}`,
      });
  });
  state.vehicles.forEach((v) => {
    if (v.id.toLowerCase().includes(q) || v.registration.toLowerCase().includes(q) || v.model.toLowerCase().includes(q))
      push({ id: v.id, type: "Vehicle", title: `${v.id} · ${v.registration}`, subtitle: `${v.model} · ${v.status}`, link: `/ops/vehicles?id=${v.id}` });
  });
  state.drivers.forEach((d) => {
    if (d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.phone.includes(q))
      push({ id: d.id, type: "Driver", title: d.name, subtitle: `${d.id} · ${d.status}`, link: `/ops/drivers?id=${d.id}` });
  });
  state.customers.forEach((c) => {
    if (c.business.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      push({ id: c.id, type: "Customer", title: c.business, subtitle: `${c.industry} · ${c.contactName}`, link: `/ops/customers?id=${c.id}` });
  });
  state.routes.forEach((r) => {
    if (r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      push({ id: r.id, type: "Route", title: `${r.id} · ${r.name}`, subtitle: `${r.stops.length} stops · ${r.status}`, link: `/ops/routes?id=${r.id}` });
  });
  state.incidents.forEach((i) => {
    if (i.id.toLowerCase().includes(q) || i.type.toLowerCase().includes(q) || i.location.toLowerCase().includes(q))
      push({ id: i.id, type: "Incident", title: `${i.id} · ${i.type}`, subtitle: `${i.location} · ${i.severity}`, link: `/ops/incidents?id=${i.id}` });
  });
  state.documents.forEach((d) => {
    if (d.name.toLowerCase().includes(q) || d.entityName.toLowerCase().includes(q))
      push({ id: d.id, type: "Document", title: d.name, subtitle: `${d.entityName} · ${d.status}`, link: `/ops/documents` });
  });
  return hits;
}

export function fuelSummary(state: AppState) {
  const byVehicle = state.vehicles.map((v) => {
    const recs = state.fuel.filter((f) => f.vehicleId === v.id);
    const units = recs.reduce((s, r) => s + r.units, 0);
    const cost = recs.reduce((s, r) => s + r.cost, 0);
    const distance = recs.reduce((s, r) => s + r.distanceKm, 0);
    return {
      vehicle: v,
      units,
      cost,
      distance,
      consumption: distance ? (units / distance) * 100 : 0, // ℓ/100km or kWh/100km
      costPerKm: distance ? cost / distance : 0,
    };
  });
  return {
    byVehicle,
    totalCost: byVehicle.reduce((s, r) => s + r.cost, 0),
    totalDistance: byVehicle.reduce((s, r) => s + r.distance, 0),
    totalLitres: byVehicle.filter((r) => r.vehicle.fuelType === "Petrol").reduce((s, r) => s + r.units, 0),
    totalKwh: byVehicle.filter((r) => r.vehicle.fuelType === "Electric").reduce((s, r) => s + r.units, 0),
  };
}
