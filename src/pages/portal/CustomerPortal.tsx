import { useEffect, useMemo, useState } from "react";
import { BarChart, Donut, LineChart } from "@/components/charts";
import { FleetMap } from "@/components/FleetMap";
import { Icon, Logo } from "@/components/Icon";
import {
  Badge, Banner, Button, Card, CardHeader, EmptyState, Input, KeyValue, PageHeader, Progress, Row, Stat,
  StatusBadge, TableWrap, Td, Th,
} from "@/components/ui";
import { CreateDeliveryModal, DeliveryDrawer } from "@/components/workflow/DeliveryWorkflows";
import { SUBURBS } from "@/data/seed";
import { dateSA, dateTimeSA, downloadCSV, num, pct, relTime, time24, zar } from "@/lib/format";
import { Link, useRouter } from "@/router";
import { customerStats } from "@/state/selectors";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

const NAV = [
  { label: "Dashboard", to: "/portal", icon: "dashboard" },
  { label: "Deliveries", to: "/portal/deliveries", icon: "package" },
  { label: "Create Delivery", to: "/portal/create", icon: "plus" },
  { label: "Tracking", to: "/portal/tracking", icon: "pin" },
  { label: "Proof of Delivery", to: "/portal/pod", icon: "clipboard" },
  { label: "Reports", to: "/portal/reports", icon: "file" },
  { label: "Account", to: "/portal/account", icon: "briefcase" },
];

export default function CustomerPortal({ page }: { page: string }) {
  const { state, dispatch } = useStore();
  const { params, setParam, navigate } = useRouter();
  const [createOpen, setCreateOpen] = useState(page === "/portal/create");
  const [menuOpen, setMenuOpen] = useState(false);

  const customer = state.customers.find((c) => c.id === state.session.customerId) ?? state.customers[0];
  const stats = useMemo(() => customerStats(state, customer.id), [state, customer.id]);
  const openId = params.get("id");

  // Opening /portal/create from anywhere should bring up the booking form
  useEffect(() => {
    if (page === "/portal/create") setCreateOpen(true);
  }, [page]);

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-mist-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 lg:px-6">
          <Link to="/portal"><Logo /></Link>
          <span className="hidden rounded border border-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-400 sm:inline">
            Customer Portal
          </span>
          <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Portal navigation">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn("rounded-md px-2.5 py-1.5 text-[13px] font-medium", page === n.to ? "bg-white/10 text-white" : "text-mist-300 hover:bg-white/5 hover:text-white")}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={customer.id}
              onChange={(e) => dispatch({ type: "SET_SESSION", patch: { customerId: e.target.value } })}
              className="hidden h-8 rounded-md border border-white/20 bg-navy-900 px-2 text-[12.5px] text-white sm:block"
              aria-label="Switch business account (demo)"
            >
              {state.customers.map((c) => <option key={c.id} value={c.id}>{c.business}</option>)}
            </select>
            <Link to="/" className="grid h-8 w-8 place-items-center rounded-md border border-white/20 text-white" aria-label="Sign out">
              <Icon name="logout" className="h-4 w-4" />
            </Link>
            <button className="grid h-8 w-8 place-items-center rounded-md border border-white/20 text-white lg:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
              <Icon name={menuOpen ? "x" : "menu"} className="h-4 w-4" />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="border-t border-white/10 bg-navy-900 px-3 py-2 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded px-3 py-2.5 text-[14px] font-medium text-mist-200">
                <Icon name={n.icon} className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 lg:px-6 lg:py-6">{children}</main>
      <footer className="border-t border-mist-200 bg-white px-4 py-3 text-center text-[11.5px] text-charcoal-400">
        Easy Drop Business Customer Portal · Demo environment — simulated data
      </footer>
      <CreateDeliveryModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); if (page === "/portal/create") navigate("/portal/deliveries"); }}
        source="Customer Portal"
        lockCustomerId={customer.id}
      />
      <DeliveryDrawer deliveryId={openId} onClose={() => setParam("id", null)} context="portal" />
    </div>
  );

  /* ------------------------------ Dashboard ----------------------------- */
  if (page === "/portal") {
    const recent = stats.deliveries.slice(0, 8);
    return shell(
      <>
        <PageHeader
          title={`Welcome, ${customer.contactName.split(" ")[0]}`}
          description={`${customer.business} · account ${customer.accountNumber} · ${customer.contract}`}
          actions={<Button variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>Create delivery</Button>}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Stat label="Active deliveries" value={stats.active} icon="truck" onClick={() => navigate("/portal/tracking")} />
          <Stat label="Completed today" value={stats.completed} tone="success" icon="check" onClick={() => navigate("/portal/deliveries")} />
          <Stat label="Failed" value={stats.failed} tone={stats.failed ? "warning" : "success"} icon="warning" onClick={() => navigate("/portal/deliveries")} />
          <Stat label="On-time" value={pct(stats.onTimePct)} tone={stats.onTimePct >= customer.slaTargetPct ? "success" : "warning"} sub={`SLA ${customer.slaTargetPct}%`} icon="clock" />
          <Stat label="First attempt" value={pct(stats.firstAttemptPct)} tone={stats.firstAttemptPct >= 90 ? "success" : "warning"} icon="target" />
          <Stat label="Spend today" value={zar(stats.spend)} icon="money" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader title="Recent deliveries" subtitle="Your latest bookings and their status" icon="package" action={<Link to="/portal/deliveries"><Button size="xs" variant="ghost" icon="arrowRight">View all</Button></Link>} />
            <TableWrap>
              <thead><tr><Th>Delivery</Th><Th>Recipient</Th><Th>Destination</Th><Th>Status</Th><Th>ETA</Th></tr></thead>
              <tbody>
                {recent.map((d) => (
                  <Row key={d.id} onClick={() => setParam("id", d.id)}>
                    <Td className="font-semibold text-navy-950">{d.id}</Td>
                    <Td>{d.recipient}</Td>
                    <Td className="max-w-[180px] truncate">{d.destination}, {d.suburb}</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td className="num">{time24(d.eta)}</Td>
                  </Row>
                ))}
              </tbody>
            </TableWrap>
            {!recent.length && <EmptyState icon="package" title="No deliveries yet" message="Create your first delivery to get started." action={<Button variant="primary" onClick={() => setCreateOpen(true)}>Create delivery</Button>} />}
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader title="Today at a glance" subtitle="Where your parcels are" icon="grid" />
              <div className="p-4">
                <Donut
                  segments={[
                    { label: "Delivered", value: stats.completed, colour: "#12a05c" },
                    { label: "On the road", value: stats.active, colour: "#2b5480" },
                    { label: "Failed", value: stats.failed, colour: "#dc2626" },
                  ]}
                  centreValue={String(stats.total)}
                  centreLabel="deliveries"
                />
              </div>
            </Card>
            <Card>
              <CardHeader title="Recent activity" subtitle="Updates on your account" icon="activity" />
              <ul className="divide-y divide-mist-100">
                {stats.deliveries.slice(0, 6).map((d) => {
                  const last = d.events[d.events.length - 1];
                  return (
                    <li key={d.id}>
                      <button onClick={() => setParam("id", d.id)} className="flex w-full items-start gap-2 px-4 py-2.5 text-left hover:bg-mist-50">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold text-navy-950">{d.id} · {last?.label}</span>
                          <span className="block truncate text-[12px] text-charcoal-400">{last?.detail}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-charcoal-400">{relTime(last?.at ?? d.createdAt)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        </div>
      </>,
    );
  }

  /* ------------------------------ Deliveries ---------------------------- */
  if (page === "/portal/deliveries") {
    return shell(<PortalDeliveries customerId={customer.id} onOpen={(id) => setParam("id", id)} onCreate={() => setCreateOpen(true)} />);
  }

  /* --------------------------- Create delivery -------------------------- */
  if (page === "/portal/create") {
    return shell(
      <>
        <PageHeader title="Create Delivery" description="Book a parcel for collection. Your booking goes straight to the Easy Drop operations team." actions={<Button variant="primary" icon="plus" onClick={() => setCreateOpen(true)}>Open booking form</Button>} />
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["1. Tell us where to collect", "Choose one of your registered pickup locations and a collection window."],
            ["2. Tell us where it is going", "Recipient, phone number, street address and suburb."],
            ["3. Tell us about the parcel", "Parcel count, weight, service level and priority."],
          ].map(([t, d]) => (
            <Card key={t} className="p-5">
              <h3 className="text-[15px] font-bold text-navy-950">{t}</h3>
              <p className="mt-1.5 text-[13.5px] text-charcoal-500">{d}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-4">
          <CardHeader title="Your registered pickup locations" icon="hub" />
          <ul className="divide-y divide-mist-100">
            {customer.pickupLocations.map((p) => (
              <li key={p} className="flex items-center gap-2 px-4 py-3 text-[13.5px] text-charcoal-700">
                <Icon name="pin" className="h-4 w-4 text-brand-600" /> {p}
              </li>
            ))}
          </ul>
        </Card>
      </>,
    );
  }

  /* ------------------------------- Tracking ----------------------------- */
  if (page === "/portal/tracking") {
    const active = stats.deliveries.filter((d) => !["Delivered", "Failed", "Returned"].includes(d.status));
    const selectedId = params.get("track") ?? active[0]?.id;
    const delivery = state.deliveries.find((d) => d.id === selectedId);
    const vehicle = state.vehicles.find((v) => v.id === delivery?.vehicleId);
    const driver = state.drivers.find((d) => d.id === delivery?.driverId);
    const route = state.routes.find((r) => r.id === delivery?.routeId);
    const dest = SUBURBS.find((s) => s.name === delivery?.suburb);

    return shell(
      <>
        <PageHeader
          title="Tracking"
          description="Follow your parcels as they move through the route."
          actions={<Button variant={state.simulating ? "warning" : "secondary"} icon={state.simulating ? "pause" : "play"} onClick={() => dispatch({ type: "SET_SIMULATING", on: !state.simulating })}>{state.simulating ? "Pause" : "Simulate"} movement</Button>}
        />
        {!delivery ? (
          <Card><EmptyState icon="pin" title="Nothing in transit" message="When a parcel is on the road it will appear here." action={<Button variant="primary" onClick={() => setCreateOpen(true)}>Create delivery</Button>} /></Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <Card className="order-2 lg:order-1">
              <CardHeader title="Your parcels" subtitle={`${active.length} in progress`} icon="package" />
              <ul className="scroll-thin max-h-[480px] divide-y divide-mist-100 overflow-y-auto">
                {active.map((d) => (
                  <li key={d.id}>
                    <button onClick={() => setParam("track", d.id)} className={cn("w-full px-4 py-2.5 text-left hover:bg-mist-50", d.id === delivery.id && "bg-brand-50/60")}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-navy-950">{d.id}</span>
                        <StatusBadge status={d.status} />
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-charcoal-400">{d.destination}, {d.suburb}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
            <div className="order-1 space-y-4 lg:order-2">
              <Card>
                <CardHeader title={`${delivery.id} · ${delivery.recipient}`} subtitle={`${delivery.destination}, ${delivery.suburb}`} icon="pin" action={<StatusBadge status={delivery.status} />} />
                <div className="p-3">
                  <FleetMap vehicles={vehicle ? [vehicle] : []} routes={route ? [route] : []} height={300} showZones={false} focusPoint={dest ? { x: dest.x, y: dest.y, label: delivery.suburb } : null} />
                </div>
                <div className="grid gap-3 border-t border-mist-200 p-4 sm:grid-cols-4">
                  {[["Driver", driver?.name ?? "Being assigned"], ["Vehicle", vehicle?.id ?? "—"], ["Route", route?.name ?? "—"], ["Estimated arrival", time24(delivery.eta)]].map(([l, v]) => (
                    <div key={l}>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-charcoal-400">{l}</p>
                      <p className="mt-0.5 text-[13.5px] font-semibold text-navy-950">{v}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHeader title="Timeline" subtitle="Every recorded step for this parcel" icon="clock" action={<Button size="sm" variant="secondary" onClick={() => setParam("id", delivery.id)}>Full details</Button>} />
                <ol className="divide-y divide-mist-100">
                  {delivery.events.map((e, i) => (
                    <li key={i} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="num w-12 shrink-0 text-[12px] font-semibold text-charcoal-400">{time24(e.at)}</span>
                      <span>
                        <span className="block text-[13px] font-semibold text-navy-950">{e.label}</span>
                        <span className="block text-[12px] text-charcoal-400">{e.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          </div>
        )}
      </>,
    );
  }

  /* ---------------------------------- POD -------------------------------- */
  if (page === "/portal/pod") {
    const withPod = stats.deliveries.filter((d) => d.pod);
    const selected = state.deliveries.find((d) => d.id === (params.get("pod") ?? withPod[0]?.id));
    return shell(
      <>
        <PageHeader title="Proof of Delivery" description="Signature, photo, time, location, driver and vehicle for every completed delivery." />
        {!withPod.length ? (
          <Card><EmptyState icon="clipboard" title="No proof of delivery yet" message="Once a parcel is delivered, the POD appears here automatically." /></Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <Card>
              <CardHeader title="Completed deliveries" subtitle={`${withPod.length} with proof of delivery`} icon="check" />
              <ul className="scroll-thin max-h-[520px] divide-y divide-mist-100 overflow-y-auto">
                {withPod.slice(0, 40).map((d) => (
                  <li key={d.id}>
                    <button onClick={() => setParam("pod", d.id)} className={cn("w-full px-4 py-2.5 text-left hover:bg-mist-50", selected?.id === d.id && "bg-brand-50/60")}>
                      <span className="block text-[13px] font-semibold text-navy-950">{d.id}</span>
                      <span className="block truncate text-[12px] text-charcoal-400">{d.recipient} · {d.suburb}</span>
                      <span className="block text-[11.5px] text-charcoal-400">{time24(d.pod!.capturedAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
            {selected?.pod && (
              <Card>
                <CardHeader
                  title={`Proof of delivery · ${selected.id}`}
                  subtitle={dateTimeSA(selected.pod.capturedAt)}
                  icon="clipboard"
                  action={<Button size="sm" variant="secondary" icon="printer" onClick={() => window.print()}>Print</Button>}
                />
                <div className="space-y-4 p-4">
                  <KeyValue
                    items={[
                      ["Delivery", selected.id],
                      ["Recipient", selected.pod.recipient],
                      ["Date", dateSA(selected.pod.capturedAt)],
                      ["Time", time24(selected.pod.capturedAt)],
                      ["Location", selected.pod.location],
                      ["Address", `${selected.destination}, ${selected.suburb}`],
                      ["Driver", state.drivers.find((d) => d.id === selected.pod?.driverId)?.name ?? "—"],
                      ["Vehicle", selected.pod.vehicleId],
                    ]}
                  />
                  <div>
                    <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Signature</p>
                    <svg viewBox="0 0 300 110" className="h-28 w-full rounded border border-mist-200 bg-white">
                      <path d={selected.pod.signature} fill="none" stroke="#081120" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Photo</p>
                    <div className="flex items-center gap-3 rounded border border-mist-200 bg-mist-50 p-3">
                      <span className="grid h-12 w-16 place-items-center rounded bg-navy-950/5 text-navy-700"><Icon name="camera" className="h-5 w-5" /></span>
                      <p className="text-[12.5px] text-charcoal-700">{selected.pod.photo}</p>
                    </div>
                  </div>
                  {selected.pod.notes && <p className="text-[12.5px] text-charcoal-500">Notes: {selected.pod.notes}</p>}
                </div>
              </Card>
            )}
          </div>
        )}
      </>,
    );
  }

  /* -------------------------------- Reports ------------------------------ */
  if (page === "/portal/reports") {
    const monthly = state.history.slice(-30).map((h) => ({
      label: h.date.slice(8),
      value: Math.round((h.deliveries * customer.monthlyVolume) / 10000),
    }));
    return shell(
      <>
        <PageHeader
          title="Reports"
          description={`Delivery performance for ${customer.business}.`}
          actions={
            <>
              <Button variant="secondary" icon="printer" onClick={() => window.print()}>Print</Button>
              <Button variant="primary" icon="download" onClick={() => downloadCSV(`easydrop-${customer.id}-deliveries.csv`, stats.deliveries.map((d) => ({ Delivery: d.id, Recipient: d.recipient, Suburb: d.suburb, Service: d.service, Status: d.status, "On time": d.onTime === null ? "" : d.onTime ? "Yes" : "No", Price: d.price })))}>Export CSV</Button>
            </>
          }
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat label="Deliveries today" value={stats.total} icon="package" />
          <Stat label="Completed" value={stats.completed} tone="success" icon="check" />
          <Stat label="Failed" value={stats.failed} tone={stats.failed ? "warning" : "success"} icon="warning" />
          <Stat label="On-time" value={pct(stats.onTimePct)} tone={stats.onTimePct >= customer.slaTargetPct ? "success" : "warning"} icon="clock" />
          <Stat label="First attempt" value={pct(stats.firstAttemptPct)} tone="success" icon="target" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Delivery volume" subtitle="Your estimated daily volume this month" icon="activity" />
            <div className="p-4"><BarChart data={monthly} height={200} /></div>
          </Card>
          <Card>
            <CardHeader title="On-time trend" subtitle={`Against your ${customer.slaTargetPct}% service level target`} icon="clock" />
            <div className="p-4">
              <LineChart data={state.history.slice(-30).map((h) => ({ label: h.date.slice(8), value: h.onTimePct }))} height={200} target={customer.slaTargetPct} targetLabel={`SLA ${customer.slaTargetPct}%`} valueFormat={(v) => `${v.toFixed(1)}%`} />
            </div>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader title="Delivery detail" subtitle="Every delivery booked on this account today" icon="list" />
          <TableWrap>
            <thead><tr><Th>Delivery</Th><Th>Recipient</Th><Th>Suburb</Th><Th>Service</Th><Th>Status</Th><Th>On time</Th><Th>Price</Th></tr></thead>
            <tbody>
              {stats.deliveries.slice(0, 40).map((d) => (
                <Row key={d.id} onClick={() => setParam("id", d.id)}>
                  <Td className="font-semibold text-navy-950">{d.id}</Td>
                  <Td>{d.recipient}</Td>
                  <Td>{d.suburb}</Td>
                  <Td>{d.service}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td>{d.onTime === null ? "—" : d.onTime ? <Badge tone="success">Yes</Badge> : <Badge tone="warning">No</Badge>}</Td>
                  <Td className="num">{zar(d.price)}</Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </>,
    );
  }

  /* -------------------------------- Account ------------------------------ */
  return shell(
    <>
      <PageHeader title="Account" description="Your business details, contract, service levels and billing information." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Business details" icon="briefcase" />
          <div className="p-4">
            <KeyValue
              items={[
                ["Business", customer.business],
                ["Industry", customer.industry],
                ["Account number", customer.accountNumber],
                ["Customer since", dateSA(customer.since)],
                ["Contact person", customer.contactName],
                ["Phone", customer.phone],
                ["Email", customer.email],
                ["Monthly volume", `${num(customer.monthlyVolume)} deliveries`],
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Contract & service level" icon="badge" />
          <div className="space-y-4 p-4">
            <KeyValue
              items={[
                ["Contract type", customer.contract],
                ["SLA target", `${customer.slaTargetPct}% on-time`],
                ["Current on-time", pct(customer.onTimePct)],
                ["Complaints this month", String(customer.complaints)],
                ["Billing terms", customer.billingTerms],
                ["Invoice value (month)", zar(customer.revenueMtd)],
              ]}
            />
            <div>
              <p className="mb-1.5 text-[12px] font-semibold text-charcoal-500">Performance against SLA</p>
              <Progress value={customer.onTimePct} tone={customer.onTimePct >= customer.slaTargetPct ? "success" : "warning"} />
            </div>
            {customer.onTimePct < customer.slaTargetPct && (
              <Banner tone="warning" icon="info" title="Below service level target">
                Your account manager reviews any month that finishes below target and reports back on corrective action.
              </Banner>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Pickup locations" icon="hub" />
          <ul className="divide-y divide-mist-100">
            {customer.pickupLocations.map((p) => (
              <li key={p} className="flex items-center gap-2 px-4 py-3 text-[13.5px] text-charcoal-700">
                <Icon name="pin" className="h-4 w-4 text-brand-600" /> {p}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Billing information" icon="money" />
          <div className="p-4">
            <KeyValue
              items={[
                ["Billing entity", customer.business],
                ["Account number", customer.accountNumber],
                ["Terms", customer.billingTerms],
                ["Current month to date", zar(customer.revenueMtd)],
                ["Deliveries billed", num(customer.deliveriesMtd)],
                ["Average per delivery", zar(customer.revenueMtd / Math.max(1, customer.deliveriesMtd), 2)],
              ]}
            />
            <p className="mt-3 text-[11.5px] text-charcoal-400">Illustrative demo data — not an actual invoice.</p>
          </div>
        </Card>
      </div>
    </>,
  );
}

function PortalDeliveries({ customerId, onOpen, onCreate }: { customerId: string; onOpen: (id: string) => void; onCreate: () => void }) {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const all = state.deliveries.filter((d) => d.customerId === customerId);
  const list = all.filter(
    (d) => (status === "All" || d.status === status) && (d.id + d.recipient + d.destination + d.suburb).toLowerCase().includes(q.toLowerCase()),
  );
  const tabs = ["All", "Pending", "Assigned", "In Transit", "Delivered", "Failed"];

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Every parcel booked on this account, with live status."
        actions={<Button variant="primary" icon="plus" onClick={onCreate}>Create delivery</Button>}
      />
      <Card>
        <div className="flex flex-col gap-2 border-b border-mist-200 p-3 sm:flex-row sm:items-center">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by delivery, recipient or address" aria-label="Search deliveries" />
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((t) => (
              <button key={t} onClick={() => setStatus(t)} aria-pressed={status === t}
                className={cn("h-8 rounded-md border px-2.5 text-[12.5px] font-semibold", status === t ? "border-navy-950 bg-navy-950 text-white" : "border-mist-300 bg-white text-charcoal-500")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <EmptyState icon="package" title="No deliveries match" message="Try another status or search term." />
        ) : (
          <TableWrap>
            <thead><tr><Th>Delivery</Th><Th>Recipient</Th><Th>Destination</Th><Th className="hidden md:table-cell">Service</Th><Th className="hidden lg:table-cell">Driver</Th><Th>Status</Th><Th>ETA</Th><Th>Price</Th></tr></thead>
            <tbody>
              {list.slice(0, 50).map((d) => (
                <Row key={d.id} onClick={() => onOpen(d.id)}>
                  <Td className="font-semibold text-navy-950">{d.id}</Td>
                  <Td>{d.recipient}</Td>
                  <Td className="max-w-[200px] truncate">{d.destination}, {d.suburb}</Td>
                  <Td className="hidden md:table-cell">{d.service}</Td>
                  <Td className="hidden lg:table-cell">{state.drivers.find((x) => x.id === d.driverId)?.name ?? "Being assigned"}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td className="num">{time24(d.eta)}</Td>
                  <Td className="num">{zar(d.price)}</Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
