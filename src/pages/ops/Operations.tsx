import { useMemo, useState } from "react";
import { FleetMap } from "@/components/FleetMap";
import { Icon } from "@/components/Icon";
import {
  Badge, Banner, Button, Card, CardHeader, EmptyState, Input, KeyValue, PageHeader, Progress, Row, Select,
  Stat, StatusBadge, Tabs, Td, Th, TableWrap,
} from "@/components/ui";
import { AssignModal, CreateDeliveryModal, DeliveryDrawer } from "@/components/workflow/DeliveryWorkflows";
import { SUBURBS } from "@/data/seed";
import { dateTimeSA, downloadCSV, km, num, time24, zar } from "@/lib/format";
import { useRouter } from "@/router";
import { canDispatch } from "@/state/selectors";
import { useStore } from "@/state/store";
import type { Delivery, HubStage } from "@/types";
import { cn } from "@/utils/cn";

const STATUS_TABS = ["All", "Pending", "Scheduled", "Assigned", "Dispatched", "Picked Up", "In Transit", "Delivered", "Failed", "Returned"];
const PAGE_SIZE = 25;

/* ====================== DELIVERIES ====================== */

export function DeliveriesPage() {
  const { state } = useStore();
  const { params, setParam } = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const status = params.get("status") ?? "All";
  const openId = params.get("id");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.deliveries.filter((d) => {
      if (status !== "All" && d.status !== status) return false;
      if (!q) return true;
      const customer = state.customers.find((c) => c.id === d.customerId)?.business ?? "";
      return (
        d.id.toLowerCase().includes(q) ||
        d.recipient.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.destination.toLowerCase().includes(q) ||
        d.suburb.toLowerCase().includes(q) ||
        customer.toLowerCase().includes(q)
      );
    });
  }, [state.deliveries, state.customers, status, query]);

  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const counts = (s: string) => (s === "All" ? state.deliveries.length : state.deliveries.filter((d) => d.status === s).length);

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Every parcel booked today, with its customer, driver, vehicle, route and current status."
        actions={
          <>
            <Button variant="secondary" icon="download" onClick={() => downloadCSV("easydrop-deliveries.csv", filtered.map((d) => ({
              id: d.id, customer: state.customers.find((c) => c.id === d.customerId)?.business, recipient: d.recipient,
              suburb: d.suburb, service: d.service, priority: d.priority, status: d.status, driver: d.driverId, vehicle: d.vehicleId, price: d.price,
            })))}>
              Export
            </Button>
            <Button variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>
              New delivery
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-mist-200 p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Search by delivery ID, customer, recipient, phone, address or suburb"
              className="pl-8"
              aria-label="Search deliveries"
            />
          </div>
          <div className="flex items-center gap-2 text-[12.5px] text-charcoal-400">
            <Icon name="filter" className="h-4 w-4" />
            Showing <span className="num font-semibold text-navy-950">{num(filtered.length)}</span> of {num(state.deliveries.length)}
          </div>
        </div>
        <Tabs
          className="px-3"
          tabs={STATUS_TABS.map((s) => ({ key: s, label: s, count: counts(s) }))}
          active={status}
          onChange={(k) => { setParam("status", k === "All" ? null : k); setPage(0); }}
        />
        {pageItems.length === 0 ? (
          <EmptyState icon="package" title="No deliveries match your filters" message="Try a different status or clear the search." action={<Button variant="secondary" onClick={() => { setQuery(""); setParam("status", null); }}>Clear filters</Button>} />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th>Delivery</Th><Th>Customer</Th><Th>Recipient</Th><Th className="hidden xl:table-cell">Pickup</Th>
                <Th>Destination</Th><Th className="hidden lg:table-cell">Driver</Th><Th className="hidden lg:table-cell">Vehicle</Th>
                <Th className="hidden xl:table-cell">Route</Th><Th className="hidden lg:table-cell">Service</Th>
                <Th>Priority</Th><Th>Status</Th><Th>ETA</Th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((d) => (
                <Row key={d.id} onClick={() => setParam("id", d.id)}>
                  <Td className="font-semibold text-navy-950">{d.id}</Td>
                  <Td>{state.customers.find((c) => c.id === d.customerId)?.business}</Td>
                  <Td>{d.recipient}</Td>
                  <Td className="hidden max-w-[160px] truncate xl:table-cell">{d.pickup}</Td>
                  <Td className="max-w-[180px] truncate">{d.destination}, <span className="text-charcoal-400">{d.suburb}</span></Td>
                  <Td className="hidden lg:table-cell">{state.drivers.find((x) => x.id === d.driverId)?.name ?? "—"}</Td>
                  <Td className="hidden lg:table-cell">{d.vehicleId ?? "—"}</Td>
                  <Td className="hidden xl:table-cell">{d.routeId ?? "—"}</Td>
                  <Td className="hidden lg:table-cell">{d.service}</Td>
                  <Td>{d.priority === "Standard" ? <span className="text-charcoal-400">Standard</span> : <Badge tone={d.priority === "Urgent" ? "critical" : "warning"}>{d.priority}</Badge>}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td className="num">{time24(d.eta)}</Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        )}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 border-t border-mist-200 px-4 py-2.5">
            <p className="text-[12.5px] text-charcoal-400">
              Page {page + 1} of {Math.ceil(filtered.length / PAGE_SIZE)}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" icon="chevronLeft" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={(page + 1) * PAGE_SIZE >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <CreateDeliveryModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <DeliveryDrawer deliveryId={openId} onClose={() => setParam("id", null)} />
    </>
  );
}

/* ====================== DISPATCH ====================== */

export function DispatchPage() {
  const { state, dispatch, toast } = useStore();
  const { params, setParam } = useRouter();
  const [assignId, setAssignId] = useState<string | null>(null);
  const openId = params.get("id");

  const unassigned = state.deliveries.filter((d) => ["Pending", "Scheduled"].includes(d.status));
  const assigned = state.deliveries.filter((d) => d.status === "Assigned");
  const dispatched = state.deliveries.filter((d) => ["Dispatched", "Picked Up", "In Transit"].includes(d.status));
  const exceptions = state.deliveries.filter((d) => ["Failed", "Returned"].includes(d.status));
  const availableDrivers = state.drivers.filter((d) => d.status === "Available" || d.status === "On Route");
  const blockedVehicles = state.vehicles.filter((v) => !canDispatch(state, v.id).ok);

  const autoAssign = () => {
    let count = 0;
    unassigned.forEach((d) => {
      const zone = SUBURBS.find((s) => s.name === d.suburb)?.zone;
      const route = state.routes.find((r) => r.zone === zone) ?? state.routes[0];
      if (!route.vehicleId || !canDispatch(state, route.vehicleId).ok) return;
      dispatch({ type: "ASSIGN_DELIVERY", id: d.id, driverId: route.driverId, vehicleId: route.vehicleId, routeId: route.id });
      count++;
    });
    toast({ tone: count ? "success" : "warning", title: count ? `${count} deliveries assigned` : "Nothing could be assigned", message: count ? "Matched to the closest route by suburb." : "All routes are blocked or there is nothing pending." });
  };

  const dispatchAll = () => {
    let count = 0;
    assigned.forEach((d) => {
      if (d.vehicleId && canDispatch(state, d.vehicleId).ok) {
        dispatch({ type: "ADVANCE_DELIVERY", id: d.id, status: "Dispatched" });
        count++;
      }
    });
    toast({ tone: count ? "success" : "warning", title: count ? `${count} deliveries dispatched` : "Nothing dispatched", message: count ? "Vehicles have left the hub." : "Assigned vehicles are blocked — check inspections and maintenance." });
  };

  return (
    <>
      <PageHeader
        title="Dispatch"
        description="Match waiting parcels to a driver, vehicle and route, then send them out. Blocked vehicles cannot be dispatched."
        actions={
          <>
            <Button variant="secondary" icon="zap" onClick={autoAssign} disabled={!unassigned.length}>Auto-assign by zone</Button>
            <Button variant="primary" icon="send" onClick={dispatchAll} disabled={!assigned.length}>Dispatch all assigned</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Waiting for dispatch" value={unassigned.length} tone={unassigned.length ? "warning" : "success"} icon="clock" />
        <Stat label="Assigned, not sent" value={assigned.length} icon="users" />
        <Stat label="On the road" value={dispatched.length} tone="success" icon="truck" />
        <Stat label="Available drivers" value={availableDrivers.length} icon="user" />
        <Stat label="Blocked vehicles" value={blockedVehicles.length} tone={blockedVehicles.length ? "critical" : "success"} icon="warning" />
      </div>

      {blockedVehicles.length > 0 && (
        <div className="mt-4 space-y-2">
          {blockedVehicles.map((v) => (
            <Banner key={v.id} tone="critical" icon="warning" title={`${v.id} cannot be dispatched — ${v.status}`}>
              {v.blockedReason ?? "Resolve the issue before this vehicle can carry deliveries."}
            </Banner>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader title="Unassigned deliveries" subtitle="Parcels waiting for a driver, vehicle and route" icon="package" action={<Badge tone={unassigned.length ? "warning" : "success"}>{unassigned.length} waiting</Badge>} />
          {unassigned.length === 0 ? (
            <EmptyState icon="check" title="Everything is assigned" message="No parcels are waiting for dispatch right now." />
          ) : (
            <TableWrap>
              <thead>
                <tr><Th>Delivery</Th><Th>Customer</Th><Th>Destination</Th><Th>Service</Th><Th>Priority</Th><Th /></tr>
              </thead>
              <tbody>
                {unassigned.map((d) => (
                  <Row key={d.id}>
                    <Td className="font-semibold text-navy-950">
                      <button className="hover:underline" onClick={() => setParam("id", d.id)}>{d.id}</button>
                    </Td>
                    <Td>{state.customers.find((c) => c.id === d.customerId)?.business}</Td>
                    <Td className="max-w-[180px] truncate">{d.destination}, {d.suburb}</Td>
                    <Td>{d.service}</Td>
                    <Td>{d.priority === "Standard" ? <span className="text-charcoal-400">Standard</span> : <Badge tone={d.priority === "Urgent" ? "critical" : "warning"}>{d.priority}</Badge>}</Td>
                    <Td><Button size="xs" variant="primary" icon="users" onClick={() => setAssignId(d.id)}>Assign</Button></Td>
                  </Row>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>

        <Card>
          <CardHeader title="Assigned — ready to dispatch" subtitle="Confirm the vehicle is cleared, then send" icon="send" />
          {assigned.length === 0 ? (
            <EmptyState icon="send" title="Nothing waiting to leave" message="Assign deliveries first, then dispatch them from here." />
          ) : (
            <ul className="divide-y divide-mist-100">
              {assigned.map((d) => {
                const check = d.vehicleId ? canDispatch(state, d.vehicleId) : { ok: false, reason: "No vehicle" };
                return (
                  <li key={d.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <button onClick={() => setParam("id", d.id)} className="block text-[13px] font-semibold text-navy-950 hover:underline">{d.id}</button>
                      <p className="truncate text-[12px] text-charcoal-400">
                        {state.drivers.find((x) => x.id === d.driverId)?.name} · {d.vehicleId} · {d.routeId}
                      </p>
                      {!check.ok && <p className="text-[11.5px] font-semibold text-red-700">Blocked: {check.reason}</p>}
                    </div>
                    <Button size="xs" variant={check.ok ? "primary" : "secondary"} icon="send" disabled={!check.ok} onClick={() => { dispatch({ type: "ADVANCE_DELIVERY", id: d.id, status: "Dispatched" }); toast({ tone: "success", title: "Dispatched", message: `${d.id} has left the hub.` }); }}>
                      Dispatch
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => setAssignId(d.id)}>Reassign</Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Available drivers" subtitle="Who can take work now" icon="users" />
          <ul className="divide-y divide-mist-100">
            {availableDrivers.slice(0, 8).map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-950 text-[11px] font-bold text-white">{d.name.split(" ").map((n) => n[0]).join("")}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-navy-950">{d.name}</span>
                  <span className="block text-[11.5px] text-charcoal-400">{d.id} · {d.zone}</span>
                </span>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Vehicle readiness" subtitle="Inspection and maintenance status" icon="truck" />
          <ul className="divide-y divide-mist-100">
            {state.vehicles.map((v) => {
              const check = canDispatch(state, v.id);
              return (
                <li key={v.id} className="flex items-center gap-3 px-4 py-2">
                  <span className="w-16 text-[13px] font-bold text-navy-950">{v.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-charcoal-400">{check.ok ? `${v.zone} · ${v.energyPct.toFixed(0)}% ${v.fuelType === "Electric" ? "battery" : "fuel"}` : check.reason}</span>
                  <StatusBadge status={v.status} />
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Active routes" subtitle="Progress through today's stops" icon="route" />
          <ul className="divide-y divide-mist-100">
            {state.routes.map((r) => {
              const total = r.stops.length;
              const done = r.stops.filter((id) => state.deliveries.find((d) => d.id === id)?.status === "Delivered").length;
              return (
                <li key={r.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-navy-950">{r.id} · {r.name}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1.5"><Progress value={(done / Math.max(1, total)) * 100} tone={r.status === "Delayed" ? "warning" : "success"} /></div>
                  <p className="mt-1 text-[11.5px] text-charcoal-400">{done} of {total} stops complete · ETA {r.eta}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Exceptions" subtitle="Failed and returned deliveries that need a decision" icon="alert" action={<Badge tone={exceptions.length ? "critical" : "success"}>{exceptions.length}</Badge>} />
        {exceptions.length === 0 ? (
          <EmptyState icon="check" title="No exceptions" message="Nothing has failed today." />
        ) : (
          <TableWrap>
            <thead><tr><Th>Delivery</Th><Th>Customer</Th><Th>Problem</Th><Th>Driver</Th><Th>Status</Th><Th /></tr></thead>
            <tbody>
              {exceptions.map((d) => (
                <Row key={d.id}>
                  <Td className="font-semibold text-navy-950">{d.id}</Td>
                  <Td>{state.customers.find((c) => c.id === d.customerId)?.business}</Td>
                  <Td className="max-w-[240px] truncate">{d.failureReason ?? "Returned to hub"}</Td>
                  <Td>{state.drivers.find((x) => x.id === d.driverId)?.name ?? "—"}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td><Button size="xs" variant="secondary" onClick={() => setParam("id", d.id)}>Open</Button></Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      <AssignModal deliveryId={assignId} open={!!assignId} onClose={() => setAssignId(null)} />
      <DeliveryDrawer deliveryId={openId} onClose={() => setParam("id", null)} />
    </>
  );
}

/* ====================== ROUTES ====================== */

export function RoutesPage() {
  const { state } = useStore();
  const { params, setParam } = useRouter();
  const routeId = params.get("id");
  const openDelivery = params.get("delivery");
  const route = state.routes.find((r) => r.id === routeId);

  const routeRow = (id: string) => {
    const r = state.routes.find((x) => x.id === id)!;
    const stops = r.stops.map((sid) => state.deliveries.find((d) => d.id === sid)).filter(Boolean) as Delivery[];
    const done = stops.filter((s) => s.status === "Delivered").length;
    return { r, stops, done, remaining: stops.length - done };
  };

  if (route) {
    const { stops, done, remaining } = routeRow(route.id);
    const driver = state.drivers.find((d) => d.id === route.driverId);
    const vehicle = state.vehicles.find((v) => v.id === route.vehicleId);
    return (
      <>
        <PageHeader
          title={`${route.id} · ${route.name}`}
          description="Every stop on this route in sequence. Click a stop to open the delivery."
          actions={<Button variant="secondary" icon="chevronLeft" onClick={() => setParam("id", null)}>All routes</Button>}
        />
        <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <Card>
              <CardHeader title="Route summary" icon="route" action={<StatusBadge status={route.status} />} />
              <div className="p-4">
                <KeyValue
                  items={[
                    ["Driver", driver?.name ?? "Unassigned"],
                    ["Vehicle", vehicle ? `${vehicle.id} · ${vehicle.registration}` : "Unassigned"],
                    ["Zone", route.zone],
                    ["Distance", km(route.distanceKm)],
                    ["Stops", `${stops.length}`],
                    ["Completed", `${done}`],
                    ["Remaining", `${remaining}`],
                    ["Start", route.startTime],
                    ["ETA to finish", route.eta],
                    ["Progress", `${Math.round((done / Math.max(1, stops.length)) * 100)}%`],
                  ]}
                />
                <div className="mt-3"><Progress value={(done / Math.max(1, stops.length)) * 100} /></div>
              </div>
            </Card>
            <Card>
              <CardHeader title="Route on the map" icon="pin" subtitle="Simulated position of the assigned vehicle" />
              <div className="p-3">
                <FleetMap vehicles={state.vehicles.filter((v) => v.id === route.vehicleId)} routes={[route]} height={280} showZones={false} />
              </div>
            </Card>
          </div>
          <Card>
            <CardHeader title="Stops" subtitle={`${stops.length} stops in delivery sequence`} icon="list" />
            <TableWrap>
              <thead><tr><Th>#</Th><Th>Delivery</Th><Th>Customer</Th><Th>Address</Th><Th>ETA</Th><Th>Status</Th></tr></thead>
              <tbody>
                {stops.map((s, i) => (
                  <Row key={s.id} onClick={() => setParam("delivery", s.id)}>
                    <Td className="num font-semibold text-charcoal-400">{i + 1}</Td>
                    <Td className="font-semibold text-navy-950">{s.id}</Td>
                    <Td>{state.customers.find((c) => c.id === s.customerId)?.business}</Td>
                    <Td className="max-w-[220px] truncate">{s.destination}, {s.suburb}</Td>
                    <Td className="num">{time24(s.eta)}</Td>
                    <Td><StatusBadge status={s.status} /></Td>
                  </Row>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        </div>
        <DeliveryDrawer deliveryId={openDelivery} onClose={() => setParam("delivery", null)} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Routes" description="The five daily delivery routes worked from City Deep Hub. Open a route to see every stop." />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {state.routes.map((r) => {
          const { stops, done, remaining } = routeRow(r.id);
          const driver = state.drivers.find((d) => d.id === r.driverId);
          return (
            <Card key={r.id} className="overflow-hidden">
              <div className="h-1.5" style={{ background: r.colour }} />
              <CardHeader title={`${r.id} · ${r.name}`} subtitle={`${driver?.name ?? "Unassigned"} · ${r.vehicleId ?? "—"}`} icon="route" action={<StatusBadge status={r.status} />} />
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[["Stops", stops.length], ["Done", done], ["Left", remaining], ["Km", r.distanceKm]].map(([l, v]) => (
                    <div key={String(l)} className="rounded-md bg-mist-50 py-2">
                      <p className="num text-[17px] font-bold text-navy-950">{String(v)}</p>
                      <p className="text-[11px] text-charcoal-400">{String(l)}</p>
                    </div>
                  ))}
                </div>
                <Progress value={(done / Math.max(1, stops.length)) * 100} tone={r.status === "Delayed" ? "warning" : "success"} />
                <div className="flex items-center justify-between text-[12px] text-charcoal-400">
                  <span>Start {r.startTime}</span>
                  <span>ETA {r.eta}</span>
                </div>
                <Button variant="secondary" icon="arrowRight" className="w-full" onClick={() => setParam("id", r.id)}>Open route</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ====================== TRACKING ====================== */

export function TrackingPage() {
  const { state, dispatch } = useStore();
  const { params, setParam } = useRouter();
  const active = state.deliveries.filter((d) => ["Dispatched", "Picked Up", "In Transit"].includes(d.status));
  const selectedId = params.get("id") ?? active[0]?.id;
  const delivery = state.deliveries.find((d) => d.id === selectedId) ?? active[0];
  const vehicle = state.vehicles.find((v) => v.id === delivery?.vehicleId);
  const driver = state.drivers.find((d) => d.id === delivery?.driverId);
  const route = state.routes.find((r) => r.id === delivery?.routeId);
  const dest = SUBURBS.find((s) => s.name === delivery?.suburb);

  return (
    <>
      <PageHeader
        title="Tracking"
        description="Follow a parcel in real time — driver, vehicle, position, route and estimated arrival."
        actions={
          <Button variant={state.simulating ? "warning" : "primary"} icon={state.simulating ? "pause" : "play"} onClick={() => dispatch({ type: "SET_SIMULATING", on: !state.simulating })}>
            {state.simulating ? "Pause movement" : "Simulate movement"}
          </Button>
        }
      />
      {!delivery ? (
        <Card><EmptyState icon="pin" title="Nothing is on the road right now" message="Dispatch a delivery and it will appear here for live tracking." /></Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <Card className="order-2 xl:order-1">
            <CardHeader title="Parcels in transit" subtitle={`${active.length} on the road`} icon="package" />
            <ul className="scroll-thin max-h-[520px] divide-y divide-mist-100 overflow-y-auto">
              {active.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => setParam("id", d.id)}
                    className={cn("w-full px-4 py-2.5 text-left hover:bg-mist-50", d.id === delivery.id && "bg-brand-50/60")}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-navy-950">{d.id}</span>
                      <StatusBadge status={d.status} />
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-charcoal-400">{d.destination}, {d.suburb}</span>
                    <span className="block text-[11.5px] text-charcoal-400">{d.vehicleId} · ETA {time24(d.eta)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <div className="order-1 space-y-4 xl:order-2">
            <Card>
              <CardHeader
                title={`Tracking ${delivery.id}`}
                subtitle={`${state.customers.find((c) => c.id === delivery.customerId)?.business} → ${delivery.recipient}`}
                icon="pin"
                action={<StatusBadge status={delivery.status} />}
              />
              <div className="p-3">
                <FleetMap
                  vehicles={vehicle ? [vehicle] : []}
                  routes={route ? [route] : []}
                  height={330}
                  showZones={false}
                  focusPoint={dest ? { x: dest.x, y: dest.y, label: delivery.suburb } : null}
                />
              </div>
              <div className="grid gap-3 border-t border-mist-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Driver", driver?.name ?? "—", "user"],
                  ["Vehicle", vehicle ? `${vehicle.id} · ${vehicle.speed} km/h` : "—", "truck"],
                  ["Current area", vehicle ? nearestSuburb(vehicle.pos) : "—", "pin"],
                  ["Estimated arrival", time24(delivery.eta), "clock"],
                ].map(([l, v, icon]) => (
                  <div key={l} className="rounded-md border border-mist-200 bg-mist-50 p-2.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-charcoal-400">
                      <Icon name={icon} className="h-3.5 w-3.5" /> {l}
                    </p>
                    <p className="mt-0.5 truncate text-[13.5px] font-semibold text-navy-950">{v}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Delivery timeline" subtitle="Recorded events for this parcel" icon="clock" action={<Button size="sm" variant="secondary" onClick={() => setParam("open", delivery.id)}>Open full record</Button>} />
              <ol className="divide-y divide-mist-100">
                {delivery.events.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="num w-12 shrink-0 text-[12px] font-semibold text-charcoal-400">{time24(e.at)}</span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-navy-950">{e.label}</span>
                      <span className="block text-[12px] text-charcoal-400">{e.detail} {e.actor ? `· ${e.actor}` : ""}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      )}
      <DeliveryDrawer deliveryId={params.get("open")} onClose={() => setParam("open", null)} />
    </>
  );
}

const nearestSuburb = (pos: { x: number; y: number }) =>
  SUBURBS.reduce((best, s) => (Math.hypot(s.x - pos.x, s.y - pos.y) < Math.hypot(best.x - pos.x, best.y - pos.y) ? s : best), SUBURBS[0]).name;

/* ====================== HUB / DEPOT ====================== */

const STAGES: HubStage[] = ["Received", "Scanned", "Sorted", "Assigned", "Loaded", "Dispatched"];

export function HubPage() {
  const { state, dispatch, toast } = useStore();
  const { params, setParam } = useRouter();
  const [stage, setStage] = useState<HubStage>("Received");

  const inStage = (s: HubStage) => state.deliveries.filter((d) => d.hubStage === s && d.status !== "Delivered");
  const items = inStage(stage);
  const nextStage = STAGES[Math.min(STAGES.length - 1, STAGES.indexOf(stage) + 1)];

  return (
    <>
      <PageHeader
        title="Hub / Depot"
        description="City Deep Hub — parcel intake, scanning, sorting, loading and dispatch. Move parcels through the workflow as they are handled."
        actions={<Badge tone="navy">HUB-JHB-01 · City Deep</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((s, i) => (
          <button key={s} onClick={() => setStage(s)} className={cn("rounded-lg border p-3 text-left transition-colors", stage === s ? "border-brand-500 bg-brand-50" : "border-mist-200 bg-white hover:border-brand-300")}>
            <span className="num text-[11px] font-bold text-brand-600">STEP {i + 1}</span>
            <p className="text-[13.5px] font-semibold text-navy-950">{s}</p>
            <p className="num text-[22px] font-bold text-navy-950">{inStage(s).length}</p>
            <p className="text-[11px] text-charcoal-400">parcels</p>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            title={`${stage} parcels`}
            subtitle={stage === "Received" ? "Newly booked parcels waiting to be scanned in" : `Parcels currently at the “${stage}” step`}
            icon="hub"
            action={
              stage !== "Dispatched" ? (
                <Button
                  size="sm"
                  variant="primary"
                  icon="scan"
                  disabled={!items.length}
                  onClick={() => {
                    items.slice(0, 20).forEach((d) => dispatch({ type: "SET_HUB_STAGE", id: d.id, stage: nextStage }));
                    toast({ tone: "success", title: `Moved to ${nextStage}`, message: `${Math.min(20, items.length)} parcels processed.` });
                  }}
                >
                  Move batch to {nextStage}
                </Button>
              ) : undefined
            }
          />
          {items.length === 0 ? (
            <EmptyState icon="hub" title={`No parcels at “${stage}”`} message="Parcels will appear here as they move through the hub." />
          ) : (
            <TableWrap>
              <thead><tr><Th>Delivery</Th><Th>Customer</Th><Th>Destination</Th><Th>Parcels</Th><Th>Status</Th><Th /></tr></thead>
              <tbody>
                {items.slice(0, 20).map((d) => (
                  <Row key={d.id}>
                    <Td className="font-semibold text-navy-950"><button className="hover:underline" onClick={() => setParam("id", d.id)}>{d.id}</button></Td>
                    <Td>{state.customers.find((c) => c.id === d.customerId)?.business}</Td>
                    <Td className="max-w-[200px] truncate">{d.destination}, {d.suburb}</Td>
                    <Td className="num">{d.parcels} · {d.weightKg} kg</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td>
                      {stage !== "Dispatched" && (
                        <Button size="xs" variant="secondary" icon="arrowRight" onClick={() => dispatch({ type: "SET_HUB_STAGE", id: d.id, stage: nextStage })}>
                          {nextStage}
                        </Button>
                      )}
                    </Td>
                  </Row>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Hub dashboard" subtitle="Today at City Deep" icon="dashboard" />
            <div className="grid grid-cols-2 gap-3 p-4">
              <Stat label="Intake today" value={num(state.deliveries.length)} icon="download" />
              <Stat label="Dispatched" value={num(state.deliveries.filter((d) => d.hubStage === "Dispatched" || d.status === "Delivered").length)} tone="success" icon="send" />
              <Stat label="Awaiting sorting" value={num(inStage("Received").length + inStage("Scanned").length)} tone="warning" icon="layers" />
              <Stat label="Returns at hub" value={num(state.deliveries.filter((d) => d.status === "Returned").length)} tone="warning" icon="refresh" />
            </div>
          </Card>
          <Card>
            <CardHeader title="Loading by route" subtitle="What is going onto each vehicle" icon="truck" />
            <ul className="divide-y divide-mist-100">
              {state.routes.map((r) => {
                const loaded = state.deliveries.filter((d) => d.routeId === r.id && ["Loaded", "Dispatched"].includes(d.hubStage)).length;
                const planned = state.deliveries.filter((d) => d.routeId === r.id).length;
                return (
                  <li key={r.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-navy-950">{r.id} · {r.name}</span>
                      <span className="num text-charcoal-400">{loaded}/{planned}</span>
                    </div>
                    <div className="mt-1.5"><Progress value={(loaded / Math.max(1, planned)) * 100} /></div>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Hub workflow" subtitle="How a parcel moves through the depot" icon="list" />
            <ol className="space-y-2 p-4">
              {[
                ["Received", "Parcel arrives from the customer or is booked for collection."],
                ["Scanned", "Barcode scanned in — the parcel is now traceable at the hub."],
                ["Sorted", "Sorted into the correct delivery zone bay."],
                ["Assigned", "Allocated to a driver, vehicle and route."],
                ["Loaded", "Secured in the vehicle cargo compartment."],
                ["Dispatched", "Vehicle leaves the hub and the parcel goes live on the route."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-950 text-[11px] font-bold text-white">{i + 1}</span>
                  <span>
                    <span className="block text-[13px] font-semibold text-navy-950">{t}</span>
                    <span className="block text-[12px] text-charcoal-400">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
      <DeliveryDrawer deliveryId={params.get("id")} onClose={() => setParam("id", null)} />
    </>
  );
}

/* Small helper re-exported for reports */
export const deliveryRowSummary = (d: Delivery) => `${d.id} · ${d.suburb} · ${d.status} · ${zar(d.price)} · ${dateTimeSA(d.createdAt)}`;
export const SelectFilter = Select;
