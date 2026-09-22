import { useMemo, useState } from "react";
import { BarChart, Donut, HBars, LineChart, StackedBar } from "@/components/charts";
import { FleetMap } from "@/components/FleetMap";
import { Icon } from "@/components/Icon";
import { Badge, Banner, Button, Card, CardHeader, PageHeader, Stat, StatusBadge } from "@/components/ui";
import { CreateDeliveryModal, DeliveryDrawer } from "@/components/workflow/DeliveryWorkflows";
import { IncidentModal } from "@/components/workflow/FleetWorkflows";
import { num, pct, relTime, time24, zar, zarCompact } from "@/lib/format";
import { Link, useRouter } from "@/router";
import { fleetSummary, getRangeStats, RANGE_LABEL, type RangeKey } from "@/state/selectors";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const { navigate } = useRouter();
  const [range, setRange] = useState<RangeKey>("today");
  const [createOpen, setCreateOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [openDelivery, setOpenDelivery] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const stats = useMemo(() => getRangeStats(state, range), [state, range]);
  const fleet = fleetSummary(state);
  const driversOnRoute = state.drivers.filter((d) => d.status === "On Route").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const alerts = useMemo(() => {
    const out: { tone: "critical" | "warning" | "info"; icon: string; title: string; detail: string; link: string }[] = [];
    state.vehicles
      .filter((v) => v.status === "Inspection Required")
      .forEach((v) => out.push({ tone: "critical", icon: "clipboard", title: `${v.id} — inspection required`, detail: v.blockedReason ?? "Vehicle blocked from dispatch", link: `/ops/vehicles?id=${v.id}` }));
    state.maintenance
      .filter((m) => m.status === "Overdue" || m.status === "Due")
      .slice(0, 2)
      .forEach((m) => out.push({ tone: m.status === "Overdue" ? "critical" : "warning", icon: "wrench", title: `${m.vehicleId} — maintenance ${m.status.toLowerCase()}`, detail: m.service, link: "/ops/maintenance" }));
    const failed = state.deliveries.filter((d) => d.status === "Failed");
    if (failed.length) out.push({ tone: "warning", icon: "package", title: `${failed.length} failed deliveries need action`, detail: "Retry, reschedule or return to hub", link: "/ops/deliveries?status=Failed" });
    state.routes.filter((r) => r.status === "Delayed").forEach((r) => out.push({ tone: "warning", icon: "route", title: `${r.id} running late`, detail: `${r.name} · ETA ${r.eta}`, link: `/ops/routes?id=${r.id}` }));
    state.incidents.filter((i) => i.date === state.today).forEach((i) => out.push({ tone: i.severity === "High" || i.severity === "Critical" ? "critical" : "warning", icon: "shield", title: `Safety incident — ${i.type}`, detail: `${i.location} · ${i.severity}`, link: `/ops/incidents?id=${i.id}` }));
    const expiring = state.documents.filter((d) => d.status === "Expired").length;
    if (expiring) out.push({ tone: "critical", icon: "badge", title: `${expiring} compliance document(s) expired`, detail: "Review vehicle and driver documents", link: "/ops/documents" });
    out.push({ tone: "info", icon: "briefcase", title: "Customer complaint logged", detail: "QuickCart Online — late delivery in Midrand", link: "/ops/customers?id=CUS-005" });
    return out.slice(0, 7);
  }, [state]);

  const deliveriesByStatus = [
    { label: "Delivered", value: state.deliveries.filter((d) => d.status === "Delivered").length, colour: "#12a05c" },
    { label: "In transit", value: state.deliveries.filter((d) => ["Dispatched", "Picked Up", "In Transit"].includes(d.status)).length, colour: "#2b5480" },
    { label: "Waiting", value: state.deliveries.filter((d) => ["Pending", "Scheduled", "Assigned"].includes(d.status)).length, colour: "#d97706" },
    { label: "Failed / returned", value: state.deliveries.filter((d) => ["Failed", "Returned"].includes(d.status)).length, colour: "#dc2626" },
  ];

  const byZone = state.routes.map((r) => ({
    label: r.name,
    value: state.deliveries.filter((d) => d.routeId === r.id).length,
    colour: r.colour,
    sub: `${r.id} · ${r.stops.length} planned stops`,
  }));

  const onTimeSeries = state.history.slice(-14).map((h) => ({ label: h.date.slice(8), value: h.onTimePct }));
  const energy = state.history.slice(-10).map((h) => ({ label: h.date.slice(8), value: Math.round(h.distanceKm * 0.045) }));

  return (
    <>
      <PageHeader
        title={`${greeting}, John`}
        description="Here's what's happening across your fleet today. Everything below is live from the shared demo data."
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(RANGE_LABEL) as RangeKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setRange(k)}
                aria-pressed={range === k}
                className={cn(
                  "h-8 rounded-md border px-3 text-[12.5px] font-semibold transition-colors",
                  range === k ? "border-navy-950 bg-navy-950 text-white" : "border-mist-300 bg-white text-charcoal-500 hover:bg-mist-50",
                )}
              >
                {RANGE_LABEL[k]}
              </button>
            ))}
          </div>
        }
      />

      {/* Quick actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>
          New delivery
        </Button>
        <Button variant="secondary" icon="send" onClick={() => navigate("/ops/dispatch")}>
          Dispatch
        </Button>
        <Button variant="secondary" icon="truck" onClick={() => navigate("/ops/vehicles")}>
          View fleet
        </Button>
        <Button variant="secondary" icon="route" onClick={() => navigate("/ops/routes")}>
          View routes
        </Button>
        <Button variant="secondary" icon="shield" onClick={() => setIncidentOpen(true)}>
          Report incident
        </Button>
        <Button variant="secondary" icon="file" onClick={() => navigate("/ops/reports")}>
          View reports
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label={`Deliveries ${range === "today" ? "today" : stats.label.toLowerCase()}`} value={num(stats.deliveries)} trend={stats.trendPct} sub="vs previous period" icon="package" onClick={() => navigate("/ops/deliveries")} />
        <Stat label="Completed" value={num(stats.completed)} sub={`${pct((stats.completed / Math.max(1, stats.deliveries)) * 100)} of volume`} tone="success" icon="check" onClick={() => navigate("/ops/deliveries?status=Delivered")} />
        <Stat label="In transit" value={num(stats.inTransit)} sub="currently on the road" icon="truck" onClick={() => navigate("/ops/tracking")} />
        <Stat label="Active vehicles" value={`${fleet.active}/${fleet.total}`} sub={`${fleet.onRoute} on route · ${fleet.available} at hub`} icon="truck" onClick={() => navigate("/ops/vehicles")} />
        <Stat label="Drivers on route" value={num(driversOnRoute)} sub={`${state.drivers.length} drivers in total`} icon="users" onClick={() => navigate("/ops/drivers")} />
        <Stat label="On-time delivery" value={pct(stats.onTimePct)} tone={stats.onTimePct >= 95 ? "success" : "warning"} sub="target ≥ 95%" icon="clock" onClick={() => navigate("/ops/kpi")} />
        <Stat label="First-attempt success" value={pct(stats.firstAttemptPct)} tone={stats.firstAttemptPct >= 90 ? "success" : "warning"} sub="target ≥ 90%" icon="target" onClick={() => navigate("/ops/kpi")} />
        <Stat label="Customer complaints" value={num(stats.complaints)} tone={stats.complaints > 3 ? "warning" : "neutral"} sub="logged in this period" icon="briefcase" onClick={() => navigate("/ops/customers")} />
        <Stat label="Safety incidents" value={num(stats.incidents)} tone={stats.incidents > 0 ? "critical" : "success"} sub="target: zero preventable" icon="shield" onClick={() => navigate("/ops/safety")} />
        <Stat label="Revenue" value={zarCompact(stats.revenue)} tone="success" sub={`${zar(stats.revenue / Math.max(1, stats.completed))} per delivery`} icon="money" onClick={() => navigate("/ops/financials")} />
      </div>

      {/* Map + alerts */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Live fleet tracking"
            subtitle="Simulated vehicle positions across the Gauteng operating area"
            icon="pin"
            action={
              <>
                <Badge tone={state.simulating ? "success" : "neutral"} dot>
                  {state.simulating ? "Movement running" : "Movement paused"}
                </Badge>
                <Button size="sm" variant={state.simulating ? "warning" : "primary"} icon={state.simulating ? "pause" : "play"} onClick={() => dispatch({ type: "SET_SIMULATING", on: !state.simulating })}>
                  Simulate movement
                </Button>
              </>
            }
          />
          <div className="p-3">
            <FleetMap vehicles={state.vehicles} routes={state.routes} selectedVehicleId={selectedVehicle} onSelectVehicle={setSelectedVehicle} height={400} />
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {state.vehicles
                .filter((v) => v.status === "On Route")
                .map((v) => {
                  const driver = state.drivers.find((d) => d.id === v.driverId);
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicle(v.id)}
                      className={cn(
                        "rounded-md border p-2 text-left transition-colors",
                        selectedVehicle === v.id ? "border-brand-500 bg-brand-50" : "border-mist-200 bg-white hover:border-brand-300",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-navy-950">{v.id}</span>
                        <span className="num text-[11px] font-semibold text-brand-700">{v.speed} km/h</span>
                      </span>
                      <span className="block truncate text-[11px] text-charcoal-400">{driver?.name ?? "Unassigned"}</span>
                      <span className="block truncate text-[11px] text-charcoal-400">{v.routeId ?? "—"} · {Math.round(v.progress * 100)}% of route</span>
                    </button>
                  );
                })}
            </div>
            {selectedVehicle && (
              <div className="mt-3">
                <Banner tone="info" icon="truck" title={`${selectedVehicle} selected`} action={<Link to={`/ops/vehicles?id=${selectedVehicle}`}><Button size="sm" variant="secondary">Open vehicle</Button></Link>}>
                  {state.vehicles.find((v) => v.id === selectedVehicle)?.model} · zone {state.vehicles.find((v) => v.id === selectedVehicle)?.zone}
                </Banner>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Alerts" subtitle="Things that need attention right now" icon="alert" action={<Badge tone="critical">{alerts.filter((a) => a.tone === "critical").length} critical</Badge>} />
          <ul className="divide-y divide-mist-100">
            {alerts.map((a, i) => (
              <li key={i}>
                <button onClick={() => navigate(a.link)} className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-mist-50">
                  <span
                    className={cn(
                      "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md",
                      a.tone === "critical" ? "bg-red-50 text-red-700" : a.tone === "warning" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700",
                    )}
                  >
                    <Icon name={a.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-navy-950">{a.title}</span>
                    <span className="block truncate text-[12px] text-charcoal-400">{a.detail}</span>
                  </span>
                  <Icon name="chevronRight" className="mt-1 h-4 w-4 shrink-0 text-charcoal-400" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Analytics */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Delivery volume" subtitle={range === "today" ? "Bookings by hour today" : `Daily volume · ${stats.label}`} icon="activity" />
          <div className="p-4">
            <BarChart data={stats.series} height={170} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Completed vs failed" subtitle="Where today's volume sits right now" icon="grid" />
          <div className="p-4">
            <Donut segments={deliveriesByStatus} centreValue={num(state.deliveries.length)} centreLabel="deliveries" />
          </div>
        </Card>
        <Card>
          <CardHeader title="On-time performance" subtitle="Last 14 days against the 95% target" icon="clock" />
          <div className="p-4">
            <LineChart data={onTimeSeries} height={170} target={95} targetLabel="Target 95%" valueFormat={(v) => `${v.toFixed(1)}%`} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Fleet utilisation" subtitle="Vehicle availability right now" icon="truck" />
          <div className="space-y-3 p-4">
            <StackedBar
              parts={[
                { label: "On route", value: fleet.onRoute, colour: "#2b5480" },
                { label: "Available", value: fleet.available, colour: "#12a05c" },
                { label: "Maintenance", value: fleet.maintenance, colour: "#d97706" },
                { label: "Blocked", value: fleet.blocked, colour: "#dc2626" },
              ]}
              height={12}
            />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-md bg-mist-50 p-3">
                <p className="text-[11.5px] font-semibold uppercase text-charcoal-400">Availability</p>
                <p className="num text-[22px] font-bold text-brand-600">{pct(fleet.availabilityPct)}</p>
                <p className="text-[11.5px] text-charcoal-400">Target ≥ 95%</p>
              </div>
              <div className="rounded-md bg-mist-50 p-3">
                <p className="text-[11.5px] font-semibold uppercase text-charcoal-400">Maintenance due</p>
                <p className="num text-[22px] font-bold text-amber-600">{fleet.maintenanceDue}</p>
                <p className="text-[11.5px] text-charcoal-400">jobs due or overdue</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Deliveries by zone" subtitle="Volume across the five operating routes" icon="route" />
          <div className="p-4">
            <HBars data={byZone} onRowClick={() => navigate("/ops/routes")} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Fuel & energy usage" subtitle="Estimated litres / kWh per day" icon="fuel" action={<Link to="/ops/fuel"><Button size="xs" variant="ghost" icon="arrowRight">Detail</Button></Link>} />
          <div className="p-4">
            <BarChart data={energy} height={170} colour="#2b5480" valueFormat={(v) => `${Math.round(v)}`} />
          </div>
        </Card>
      </div>

      {/* Activity + attention list */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent activity" subtitle="Everything the platform has recorded today" icon="activity" action={<Link to="/ops/notifications"><Button size="xs" variant="ghost" icon="arrowRight">All notifications</Button></Link>} />
          <ul className="scroll-thin max-h-[360px] divide-y divide-mist-100 overflow-y-auto">
            {state.activities.slice(0, 12).map((a) => (
              <li key={a.id}>
                <button onClick={() => navigate(a.link)} className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-mist-50">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mist-100 text-navy-700">
                    <Icon name={a.kind === "safety" ? "shield" : a.kind === "maintenance" ? "wrench" : a.kind === "vehicle" ? "truck" : a.kind === "driver" ? "user" : a.kind === "route" ? "route" : "package"} className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-navy-950">{a.title}</span>
                    <span className="block truncate text-[12px] text-charcoal-400">{a.detail}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-charcoal-400">{relTime(a.at)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Needs attention" subtitle="Deliveries not yet completed" icon="package" action={<Link to="/ops/deliveries"><Button size="xs" variant="ghost" icon="arrowRight">All deliveries</Button></Link>} />
          <ul className="scroll-thin max-h-[360px] divide-y divide-mist-100 overflow-y-auto">
            {state.deliveries
              .filter((d) => !["Delivered"].includes(d.status))
              .slice(0, 12)
              .map((d) => (
                <li key={d.id}>
                  <button onClick={() => setOpenDelivery(d.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-mist-50">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-navy-950">
                        {d.id} · {state.customers.find((c) => c.id === d.customerId)?.business}
                      </span>
                      <span className="block truncate text-[12px] text-charcoal-400">
                        {d.destination}, {d.suburb} · ETA {time24(d.eta)}
                      </span>
                    </span>
                    <StatusBadge status={d.status} />
                  </button>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <CreateDeliveryModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <IncidentModal open={incidentOpen} onClose={() => setIncidentOpen(false)} />
      <DeliveryDrawer deliveryId={openDelivery} onClose={() => setOpenDelivery(null)} />
    </>
  );
}
