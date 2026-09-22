import { useMemo, useState } from "react";
import { BarChart, HBars, LineChart } from "@/components/charts";
import {
  Banner, Button, Card, CardHeader, EmptyState, Input, KeyValue, PageHeader, Progress, Row, Stat,
  StatusBadge, Tabs, TableWrap, Td, Th,
} from "@/components/ui";
import { InspectionModal, MaintenanceModal } from "@/components/workflow/FleetWorkflows";
import { dateSA, downloadCSV, km, num, pct, zar } from "@/lib/format";
import { useRouter } from "@/router";
import { fleetSummary, fuelSummary } from "@/state/selectors";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

/* ====================== VEHICLES ====================== */

export function VehiclesPage() {
  const { state, dispatch, toast } = useStore();
  const { params, setParam } = useRouter();
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [maintOpen, setMaintOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const vehicleId = params.get("id");
  const vehicle = state.vehicles.find((v) => v.id === vehicleId);
  const fleet = fleetSummary(state);

  if (vehicle) {
    const driver = state.drivers.find((d) => d.id === vehicle.driverId);
    const jobs = state.maintenance.filter((m) => m.vehicleId === vehicle.id);
    const inspections = state.inspections.filter((i) => i.vehicleId === vehicle.id);
    const fuel = state.fuel.filter((f) => f.vehicleId === vehicle.id);
    const docs = state.documents.filter((d) => d.entityId === vehicle.id);
    const deliveries = state.deliveries.filter((d) => d.vehicleId === vehicle.id);
    const profit = vehicle.revenueMtd - vehicle.costsMtd;

    return (
      <>
        <PageHeader
          title={`${vehicle.id} · ${vehicle.registration}`}
          description={`${vehicle.model} (${vehicle.year}) · ${vehicle.type} · ${vehicle.fuelType}`}
          actions={
            <>
              <Button variant="secondary" icon="chevronLeft" onClick={() => setParam("id", null)}>All vehicles</Button>
              <Button variant="secondary" icon="wrench" onClick={() => setMaintOpen(true)}>Book maintenance</Button>
              <Button variant="primary" icon="clipboard" onClick={() => setInspectId(vehicle.id)}>Run inspection</Button>
            </>
          }
        />

        {vehicle.status !== "Available" && vehicle.status !== "On Route" && (
          <div className="mb-4">
            <Banner
              tone="critical"
              icon="warning"
              title={`${vehicle.id} is ${vehicle.status.toLowerCase()} — dispatch is blocked`}
              action={
                <Button size="sm" variant="primary" onClick={() => { dispatch({ type: "SET_VEHICLE_STATUS", vehicleId: vehicle.id, status: "Available", reason: undefined }); toast({ tone: "success", title: "Vehicle returned to service", message: `${vehicle.id} is available for dispatch.` }); }}>
                  Mark available
                </Button>
              }
            >
              {vehicle.blockedReason ?? "Resolve the outstanding issue to return this vehicle to service."}
            </Banner>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Status" value={<span className="text-[18px]">{vehicle.status}</span>} tone={vehicle.status === "Available" || vehicle.status === "On Route" ? "success" : "critical"} icon="truck" />
          <Stat label="Mileage" value={num(vehicle.mileageKm)} sub="km on the clock" icon="activity" />
          <Stat label={vehicle.fuelType === "Electric" ? "Battery" : "Fuel"} value={pct(vehicle.energyPct)} tone={vehicle.energyPct < 25 ? "warning" : "success"} icon="fuel" />
          <Stat label="Utilisation" value={pct(vehicle.utilisationPct)} icon="target" />
          <Stat label="Revenue (month)" value={zar(vehicle.revenueMtd)} tone="success" icon="money" />
          <Stat label="Profit (month)" value={zar(profit)} tone={profit > 0 ? "success" : "critical"} icon="calculator" />
        </div>

        <Card className="mt-4">
          <Tabs
            className="px-3"
            active={tab}
            onChange={setTab}
            tabs={[
              { key: "overview", label: "Overview" },
              { key: "maintenance", label: "Maintenance", count: jobs.length },
              { key: "inspection", label: "Inspection", count: inspections.length },
              { key: "fuel", label: vehicle.fuelType === "Electric" ? "Energy" : "Fuel", count: fuel.length },
              { key: "documents", label: "Documents", count: docs.length },
              { key: "profit", label: "Profitability" },
              { key: "history", label: "History" },
            ]}
          />
          <div className="p-4">
            {tab === "overview" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <KeyValue
                  items={[
                    ["Vehicle ID", vehicle.id],
                    ["Registration", vehicle.registration],
                    ["Model", vehicle.model],
                    ["Year", String(vehicle.year)],
                    ["Vehicle type", vehicle.type],
                    ["Payload", `${vehicle.payloadKg} kg`],
                    ["Fuel type", vehicle.fuelType],
                    ["Mileage", km(vehicle.mileageKm)],
                    ["Assigned driver", driver?.name ?? "Unassigned"],
                    ["Zone", vehicle.zone],
                    ["Route", vehicle.routeId ?? "—"],
                    ["Availability", vehicle.status === "Available" || vehicle.status === "On Route" ? "Available for work" : "Not available"],
                    ["Last inspection", `${dateSA(vehicle.lastInspection)} · ${vehicle.lastInspectionResult}`],
                    ["Next service", `${dateSA(vehicle.nextServiceDate)} or ${num(vehicle.nextServiceKm)} km`],
                  ]}
                />
                <div className="space-y-3">
                  <div className="rounded-md border border-mist-200 p-3">
                    <p className="mb-1 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Service interval</p>
                    <Progress value={Math.min(100, ((vehicle.mileageKm % 10000) / 10000) * 100)} tone={vehicle.nextServiceKm - vehicle.mileageKm < 500 ? "warning" : "success"} />
                    <p className="mt-1.5 text-[12.5px] text-charcoal-500">
                      {vehicle.nextServiceKm - vehicle.mileageKm > 0
                        ? `${num(vehicle.nextServiceKm - vehicle.mileageKm)} km until the next service`
                        : `Service overdue by ${num(vehicle.mileageKm - vehicle.nextServiceKm)} km`}
                    </p>
                  </div>
                  <div className="rounded-md border border-mist-200 p-3">
                    <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Deliveries carried (today)</p>
                    <p className="num text-[26px] font-bold text-navy-950">{deliveries.length}</p>
                    <p className="text-[12.5px] text-charcoal-400">{deliveries.filter((d) => d.status === "Delivered").length} completed</p>
                  </div>
                </div>
              </div>
            )}

            {tab === "maintenance" && (
              <TableWrap>
                <thead><tr><Th>Job</Th><Th>Service</Th><Th>Mileage</Th><Th>Date</Th><Th>Technician</Th><Th>Cost</Th><Th>Status</Th><Th /></tr></thead>
                <tbody>
                  {jobs.map((m) => (
                    <Row key={m.id}>
                      <Td className="font-semibold text-navy-950">{m.id}</Td><Td>{m.service}</Td><Td className="num">{num(m.mileage)}</Td>
                      <Td>{dateSA(m.date)}</Td><Td>{m.technician}</Td><Td className="num">{zar(m.cost)}</Td><Td><StatusBadge status={m.status} /></Td>
                      <Td>
                        {m.status !== "Completed" && (
                          <Button size="xs" variant="primary" onClick={() => dispatch({ type: "UPDATE_MAINTENANCE", id: m.id, status: "Completed" })}>Complete</Button>
                        )}
                      </Td>
                    </Row>
                  ))}
                  {!jobs.length && <tr><Td className="text-charcoal-400">No maintenance history for this vehicle.</Td></tr>}
                </tbody>
              </TableWrap>
            )}

            {tab === "inspection" && (
              <div className="space-y-3">
                {inspections.map((i) => (
                  <div key={i.id} className="rounded-md border border-mist-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mist-200 bg-mist-50 px-3 py-2">
                      <span className="text-[13px] font-semibold text-navy-950">{dateSA(i.date)} · {i.time} · {state.drivers.find((d) => d.id === i.driverId)?.name}</span>
                      <StatusBadge status={i.result} />
                    </div>
                    <ul className="grid gap-x-4 gap-y-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
                      {i.items.map((it) => (
                        <li key={it.name} className="flex items-center justify-between gap-2 text-[12.5px]">
                          <span className="text-charcoal-500">{it.name}</span>
                          <span className={cn("font-semibold", it.result === "Pass" ? "text-brand-600" : "text-red-600")}>{it.result}{it.notes ? ` · ${it.notes}` : ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {!inspections.length && <EmptyState icon="clipboard" title="No inspections recorded" message="Run a pre-shift inspection to create the first record." action={<Button variant="primary" onClick={() => setInspectId(vehicle.id)}>Run inspection</Button>} />}
              </div>
            )}

            {tab === "fuel" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <TableWrap>
                  <thead><tr><Th>Date</Th><Th>{vehicle.fuelType === "Electric" ? "kWh" : "Litres"}</Th><Th>Cost</Th><Th>Distance</Th><Th>Cost / km</Th></tr></thead>
                  <tbody>
                    {fuel.slice(0, 12).map((f) => (
                      <Row key={f.id}>
                        <Td>{dateSA(f.date)}</Td><Td className="num">{f.units.toFixed(1)}</Td><Td className="num">{zar(f.cost)}</Td>
                        <Td className="num">{km(f.distanceKm)}</Td><Td className="num">{zar(f.cost / Math.max(1, f.distanceKm), 2)}</Td>
                      </Row>
                    ))}
                  </tbody>
                </TableWrap>
                <div>
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Consumption trend</p>
                  <LineChart data={fuel.slice(0, 10).reverse().map((f) => ({ label: f.date.slice(8), value: (f.units / Math.max(1, f.distanceKm)) * 100 }))} height={180} valueFormat={(v) => v.toFixed(1)} />
                  <p className="mt-2 text-[12px] text-charcoal-400">{vehicle.fuelType === "Electric" ? "kWh" : "litres"} per 100 km</p>
                </div>
              </div>
            )}

            {tab === "documents" && (
              <TableWrap>
                <thead><tr><Th>Document</Th><Th>Type</Th><Th>Issued</Th><Th>Expires</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {docs.map((d) => (
                    <Row key={d.id}>
                      <Td className="font-semibold text-navy-950">{d.name}</Td><Td>{d.docType}</Td><Td>{dateSA(d.issued)}</Td>
                      <Td>{dateSA(d.expires)}</Td><Td><StatusBadge status={d.status} /></Td>
                    </Row>
                  ))}
                </tbody>
              </TableWrap>
            )}

            {tab === "profit" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <KeyValue
                  cols={1}
                  items={[
                    ["Revenue this month", zar(vehicle.revenueMtd)],
                    ["Operating costs", zar(vehicle.costsMtd)],
                    ["Contribution", <span className={profit > 0 ? "text-brand-700" : "text-red-700"}>{zar(profit)}</span>],
                    ["Deliveries this month", num(vehicle.deliveriesMtd)],
                    ["Revenue per delivery", zar(vehicle.revenueMtd / Math.max(1, vehicle.deliveriesMtd), 2)],
                    ["Cost per delivery", zar(vehicle.costsMtd / Math.max(1, vehicle.deliveriesMtd), 2)],
                  ]}
                />
                <div>
                  <HBars
                    data={[
                      { label: "Revenue", value: vehicle.revenueMtd, colour: "#12a05c" },
                      { label: "Costs", value: vehicle.costsMtd, colour: "#d97706" },
                      { label: "Contribution", value: Math.max(0, profit), colour: "#2b5480" },
                    ]}
                    valueFormat={(v) => zar(v)}
                  />
                  <p className="mt-3 text-[12px] text-charcoal-400">Illustrative demo data — not actual company financial results.</p>
                </div>
              </div>
            )}

            {tab === "history" && (
              <ul className="divide-y divide-mist-100">
                {state.activities.filter((a) => a.detail.includes(vehicle.id) || a.link.includes(vehicle.id)).map((a) => (
                  <li key={a.id} className="py-2.5">
                    <p className="text-[13px] font-semibold text-navy-950">{a.title}</p>
                    <p className="text-[12px] text-charcoal-400">{a.detail}</p>
                  </li>
                ))}
                <li className="py-2.5">
                  <p className="text-[13px] font-semibold text-navy-950">Vehicle added to fleet</p>
                  <p className="text-[12px] text-charcoal-400">{vehicle.id} · {vehicle.model} ({vehicle.year}) commissioned at City Deep Hub</p>
                </li>
              </ul>
            )}
          </div>
        </Card>

        <InspectionModal vehicleId={inspectId} open={!!inspectId} onClose={() => setInspectId(null)} />
        <MaintenanceModal open={maintOpen} onClose={() => setMaintOpen(false)} vehicleId={vehicle.id} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="The Easy Drop fleet — status, driver, zone, mileage, energy level and readiness for dispatch."
        actions={
          <>
            <Button variant="secondary" icon="download" onClick={() => downloadCSV("easydrop-fleet.csv", state.vehicles.map((v) => ({ id: v.id, registration: v.registration, model: v.model, status: v.status, driver: v.driverId, zone: v.zone, mileage: v.mileageKm })))}>Export</Button>
            <Button variant="primary" icon="wrench" onClick={() => setMaintOpen(true)}>Book maintenance</Button>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Fleet size" value={fleet.total} icon="truck" />
        <Stat label="On route" value={fleet.onRoute} tone="success" icon="route" />
        <Stat label="At hub" value={fleet.available} icon="hub" />
        <Stat label="In maintenance" value={fleet.maintenance} tone="warning" icon="wrench" />
        <Stat label="Blocked" value={fleet.blocked} tone={fleet.blocked ? "critical" : "success"} icon="warning" />
        <Stat label="Availability" value={pct(fleet.availabilityPct)} tone={fleet.availabilityPct >= 95 ? "success" : "warning"} sub="target ≥ 95%" icon="target" />
      </div>

      <Card className="mt-4">
        <CardHeader title="Fleet list" subtitle="Click a vehicle to open its full profile" icon="truck" />
        <TableWrap>
          <thead>
            <tr>
              <Th>Vehicle</Th><Th>Registration</Th><Th className="hidden lg:table-cell">Model</Th><Th>Status</Th>
              <Th className="hidden md:table-cell">Driver</Th><Th className="hidden lg:table-cell">Zone</Th>
              <Th>Mileage</Th><Th>Energy</Th><Th className="hidden xl:table-cell">Inspection</Th><Th className="hidden xl:table-cell">Next service</Th><Th />
            </tr>
          </thead>
          <tbody>
            {state.vehicles.map((v) => (
              <Row key={v.id} onClick={() => setParam("id", v.id)}>
                <Td className="font-semibold text-navy-950">{v.id}</Td>
                <Td className="num">{v.registration}</Td>
                <Td className="hidden lg:table-cell">{v.model}</Td>
                <Td><StatusBadge status={v.status} /></Td>
                <Td className="hidden md:table-cell">{state.drivers.find((d) => d.id === v.driverId)?.name ?? "—"}</Td>
                <Td className="hidden lg:table-cell">{v.zone}</Td>
                <Td className="num">{num(v.mileageKm)} km</Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <Progress value={v.energyPct} tone={v.energyPct < 25 ? "warning" : "success"} className="w-14" />
                    <span className="num text-[12px]">{v.energyPct.toFixed(0)}%</span>
                  </span>
                </Td>
                <Td className="hidden xl:table-cell"><StatusBadge status={v.lastInspectionResult} /></Td>
                <Td className="hidden xl:table-cell">{dateSA(v.nextServiceDate)}</Td>
                <Td><Button size="xs" variant="secondary" icon="clipboard" onClick={() => setInspectId(v.id)}>Inspect</Button></Td>
              </Row>
            ))}
          </tbody>
        </TableWrap>
      </Card>

      <InspectionModal vehicleId={inspectId} open={!!inspectId} onClose={() => setInspectId(null)} />
      <MaintenanceModal open={maintOpen} onClose={() => setMaintOpen(false)} />
    </>
  );
}

/* ====================== MAINTENANCE ====================== */

export function MaintenancePage() {
  const { state, dispatch, toast } = useStore();
  const [tab, setTab] = useState("All");
  const [open, setOpen] = useState(false);
  const tabs = ["All", "Scheduled", "Due", "Overdue", "In Progress", "Completed"];
  const jobs = state.maintenance.filter((m) => tab === "All" || m.status === tab);
  const spend = state.maintenance.filter((m) => m.status === "Completed").reduce((s, m) => s + m.cost, 0);

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Workshop jobs across the fleet. Completing a job returns the vehicle to service automatically."
        actions={<Button variant="primary" icon="plus" onClick={() => setOpen(true)}>Book maintenance</Button>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Scheduled" value={state.maintenance.filter((m) => m.status === "Scheduled").length} icon="calendar" />
        <Stat label="Due" value={state.maintenance.filter((m) => m.status === "Due").length} tone="warning" icon="clock" />
        <Stat label="Overdue" value={state.maintenance.filter((m) => m.status === "Overdue").length} tone="critical" icon="warning" />
        <Stat label="In progress" value={state.maintenance.filter((m) => m.status === "In Progress").length} icon="wrench" />
        <Stat label="Spend (completed)" value={zar(spend)} icon="money" />
      </div>

      <Card className="mt-4">
        <Tabs className="px-3" tabs={tabs.map((t) => ({ key: t, label: t, count: t === "All" ? state.maintenance.length : state.maintenance.filter((m) => m.status === t).length }))} active={tab} onChange={setTab} />
        <TableWrap>
          <thead><tr><Th>Job</Th><Th>Vehicle</Th><Th>Service</Th><Th className="hidden lg:table-cell">Mileage</Th><Th>Date</Th><Th className="hidden md:table-cell">Technician</Th><Th>Cost</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>
            {jobs.map((m) => (
              <Row key={m.id}>
                <Td className="font-semibold text-navy-950">{m.id}</Td>
                <Td>{m.vehicleId}</Td>
                <Td className="max-w-[260px] truncate">{m.service}</Td>
                <Td className="num hidden lg:table-cell">{num(m.mileage)}</Td>
                <Td>{dateSA(m.date)}</Td>
                <Td className="hidden md:table-cell">{m.technician}</Td>
                <Td className="num">{zar(m.cost)}</Td>
                <Td><StatusBadge status={m.status} /></Td>
                <Td>
                  <div className="flex gap-1.5">
                    {m.status !== "In Progress" && m.status !== "Completed" && (
                      <Button size="xs" variant="secondary" onClick={() => dispatch({ type: "UPDATE_MAINTENANCE", id: m.id, status: "In Progress" })}>Start</Button>
                    )}
                    {m.status !== "Completed" && (
                      <Button size="xs" variant="primary" icon="check" onClick={() => { dispatch({ type: "UPDATE_MAINTENANCE", id: m.id, status: "Completed" }); toast({ tone: "success", title: "Maintenance completed", message: `${m.vehicleId} is available for dispatch again.` }); }}>Complete</Button>
                    )}
                  </div>
                </Td>
              </Row>
            ))}
            {!jobs.length && <tr><Td className="text-charcoal-400">No jobs with this status.</Td></tr>}
          </tbody>
        </TableWrap>
      </Card>
      <MaintenanceModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/* ====================== FUEL & ENERGY ====================== */

export function FuelPage() {
  const { state } = useStore();
  const summary = useMemo(() => fuelSummary(state), [state]);
  const daily = useMemo(() => {
    const map = new Map<string, number>();
    state.fuel.forEach((f) => map.set(f.date, (map.get(f.date) ?? 0) + f.cost));
    return Array.from(map.entries()).sort().slice(-14).map(([d, v]) => ({ label: d.slice(8), value: v }));
  }, [state.fuel]);

  return (
    <>
      <PageHeader title="Fuel & Energy" description="Petrol and electricity consumption per vehicle over the last 14 days, with cost per kilometre." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Total spend (14 days)" value={zar(summary.totalCost)} icon="money" />
        <Stat label="Distance covered" value={km(summary.totalDistance)} icon="activity" />
        <Stat label="Petrol used" value={`${num(summary.totalLitres, 1)} ℓ`} icon="fuel" />
        <Stat label="Electricity used" value={`${num(summary.totalKwh, 1)} kWh`} icon="zap" />
        <Stat label="Average cost / km" value={zar(summary.totalCost / Math.max(1, summary.totalDistance), 2)} tone="success" icon="calculator" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Daily energy spend" subtitle="Petrol and electricity combined" icon="fuel" />
          <div className="p-4"><BarChart data={daily} height={190} valueFormat={(v) => zar(v)} /></div>
        </Card>
        <Card>
          <CardHeader title="Cost per kilometre by vehicle" subtitle="Lower is better" icon="calculator" />
          <div className="p-4">
            <HBars
              data={summary.byVehicle.filter((b) => b.distance > 0).map((b) => ({ label: `${b.vehicle.id} · ${b.vehicle.fuelType}`, value: b.costPerKm, colour: b.vehicle.fuelType === "Electric" ? "#12a05c" : "#2b5480" }))}
              valueFormat={(v) => zar(v, 2)}
            />
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Consumption by vehicle" subtitle="Last 14 days of refuelling and charging records" icon="truck" />
        <TableWrap>
          <thead><tr><Th>Vehicle</Th><Th>Fuel type</Th><Th>Litres / kWh</Th><Th>Cost</Th><Th>Distance</Th><Th>Consumption</Th><Th>Cost / km</Th></tr></thead>
          <tbody>
            {summary.byVehicle.map((b) => (
              <Row key={b.vehicle.id}>
                <Td className="font-semibold text-navy-950">{b.vehicle.id}</Td>
                <Td>{b.vehicle.fuelType}</Td>
                <Td className="num">{num(b.units, 1)}</Td>
                <Td className="num">{zar(b.cost)}</Td>
                <Td className="num">{km(b.distance)}</Td>
                <Td className="num">{b.consumption.toFixed(1)} {b.vehicle.fuelType === "Electric" ? "kWh" : "ℓ"}/100 km</Td>
                <Td className="num">{zar(b.costPerKm, 2)}</Td>
              </Row>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}

/* ====================== PARTS & INVENTORY ====================== */

export function PartsPage() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState("");
  const statusOf = (p: { qty: number; minStock: number }) => (p.qty === 0 ? "Out of Stock" : p.qty < p.minStock ? "Low Stock" : "In Stock");
  const parts = state.parts.filter((p) => (p.name + p.sku + p.category + p.supplier).toLowerCase().includes(q.toLowerCase()));
  const value = state.parts.reduce((s, p) => s + p.qty * p.unitCost, 0);

  return (
    <>
      <PageHeader title="Parts & Inventory" description="Workshop stock used to keep the fleet on the road. Adjust quantities as parts are received or used." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Stock lines" value={state.parts.length} icon="box" />
        <Stat label="Low stock" value={state.parts.filter((p) => statusOf(p) === "Low Stock").length} tone="warning" icon="warning" />
        <Stat label="Out of stock" value={state.parts.filter((p) => statusOf(p) === "Out of Stock").length} tone="critical" icon="alert" />
        <Stat label="Stock value" value={zar(value)} icon="money" />
      </div>
      <Card className="mt-4">
        <CardHeader
          title="Inventory"
          icon="box"
          subtitle="Minimum stock levels trigger a low-stock warning"
          action={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parts…" className="h-8 w-48" aria-label="Search parts" />}
        />
        <TableWrap>
          <thead><tr><Th>Part</Th><Th>SKU</Th><Th className="hidden md:table-cell">Category</Th><Th>Qty</Th><Th>Min</Th><Th>Unit cost</Th><Th className="hidden lg:table-cell">Supplier</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>
            {parts.map((p) => (
              <Row key={p.id}>
                <Td className="font-semibold text-navy-950">{p.name}</Td>
                <Td className="num">{p.sku}</Td>
                <Td className="hidden md:table-cell">{p.category}</Td>
                <Td className="num font-semibold">{p.qty}</Td>
                <Td className="num">{p.minStock}</Td>
                <Td className="num">{zar(p.unitCost)}</Td>
                <Td className="hidden lg:table-cell">{p.supplier}</Td>
                <Td><StatusBadge status={statusOf(p)} /></Td>
                <Td>
                  <div className="flex gap-1">
                    <Button size="xs" variant="secondary" onClick={() => dispatch({ type: "ADJUST_PART", id: p.id, delta: -1 })} aria-label={`Use one ${p.name}`}>−</Button>
                    <Button size="xs" variant="secondary" onClick={() => dispatch({ type: "ADJUST_PART", id: p.id, delta: 5 })} aria-label={`Receive five ${p.name}`}>+5</Button>
                  </div>
                </Td>
              </Row>
            ))}
            {!parts.length && <tr><Td><EmptyState icon="box" title="No parts found" /></Td></tr>}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}
