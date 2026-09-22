import { useState } from "react";
import { HBars, LineChart } from "@/components/charts";
import { Icon } from "@/components/Icon";
import {
  Badge, Button, Card, CardHeader, EmptyState, Input, KeyValue, PageHeader, Progress, Row, Stat,
  StatusBadge, Tabs, TableWrap, Td, Th,
} from "@/components/ui";
import { IncidentModal, NearMissModal } from "@/components/workflow/FleetWorkflows";
import { DeliveryDrawer } from "@/components/workflow/DeliveryWorkflows";
import { TRAINING_COURSES } from "@/data/seed";
import { dateSA, downloadCSV, initials, num, pct, zar } from "@/lib/format";
import { useRouter } from "@/router";
import { customerStats } from "@/state/selectors";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

/* ====================== DRIVERS ====================== */

export function DriversPage() {
  const { state } = useStore();
  const { params, setParam } = useRouter();
  const [tab, setTab] = useState("overview");
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [nearMissOpen, setNearMissOpen] = useState(false);
  const driverId = params.get("id");
  const driver = state.drivers.find((d) => d.id === driverId);

  if (driver) {
    const deliveries = state.deliveries.filter((d) => d.driverId === driver.id);
    const incidents = state.incidents.filter((i) => i.driverId === driver.id);
    const nearMisses = state.nearMisses.filter((n) => n.driverId === driver.id);
    const vehicle = state.vehicles.find((v) => v.id === driver.vehicleId);
    const docs = state.documents.filter((d) => d.entityId === driver.id);

    return (
      <>
        <PageHeader
          title={driver.name}
          description={`${driver.id} · ${driver.zone} · joined ${dateSA(driver.joined)}`}
          actions={
            <>
              <Button variant="secondary" icon="chevronLeft" onClick={() => setParam("id", null)}>All drivers</Button>
              <Button variant="secondary" icon="eye" onClick={() => setNearMissOpen(true)}>Log near miss</Button>
              <Button variant="danger" icon="shield" onClick={() => setIncidentOpen(true)}>Report incident</Button>
            </>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Stat label="Status" value={<span className="text-[17px]">{driver.status}</span>} tone={driver.status === "On Route" ? "success" : "neutral"} icon="user" />
          <Stat label="Deliveries today" value={driver.deliveriesToday} icon="package" />
          <Stat label="On-time" value={pct(driver.onTimePct)} tone={driver.onTimePct >= 95 ? "success" : "warning"} icon="clock" />
          <Stat label="First attempt" value={pct(driver.firstAttemptPct)} tone={driver.firstAttemptPct >= 90 ? "success" : "warning"} icon="target" />
          <Stat label="Safety score" value={driver.safetyScore} tone={driver.safetyScore >= 85 ? "success" : driver.safetyScore >= 70 ? "warning" : "critical"} icon="shield" />
          <Stat label="Customer rating" value={driver.rating.toFixed(1)} sub="out of 5.0" icon="star" />
        </div>

        <Card className="mt-4">
          <Tabs
            className="px-3"
            active={tab}
            onChange={setTab}
            tabs={[
              { key: "overview", label: "Overview" },
              { key: "performance", label: "Performance" },
              { key: "training", label: "Training", count: driver.training.length },
              { key: "safety", label: "Safety", count: incidents.length + nearMisses.length },
              { key: "deliveries", label: "Deliveries", count: deliveries.length },
              { key: "documents", label: "Documents", count: docs.length },
            ]}
          />
          <div className="p-4">
            {tab === "overview" && (
              <KeyValue
                cols={3}
                items={[
                  ["Driver ID", driver.id],
                  ["Phone", driver.phone],
                  ["Email", driver.email],
                  ["Assigned vehicle", vehicle ? `${vehicle.id} · ${vehicle.registration}` : "Not assigned"],
                  ["Route today", driver.routeId ?? "—"],
                  ["Licence number", driver.licence],
                  ["Licence class", driver.licenceClass],
                  ["Licence expiry", dateSA(driver.licenceExpiry)],
                  ["Zone", driver.zone],
                  ["Shift started", driver.shiftStarted ? new Date(driver.shiftStarted).toTimeString().slice(0, 5) : "Not on shift"],
                  ["Lifetime deliveries", num(driver.deliveriesTotal)],
                  ["Incidents / near misses", `${driver.incidents} / ${driver.nearMisses}`],
                ]}
              />
            )}
            {tab === "performance" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <HBars
                  data={[
                    { label: "On-time delivery", value: driver.onTimePct, sub: "Target 95%" },
                    { label: "First-attempt success", value: driver.firstAttemptPct, sub: "Target 90%" },
                    { label: "Safety score", value: driver.safetyScore, sub: "Higher is better" },
                    { label: "Customer rating", value: driver.rating * 20, sub: `${driver.rating.toFixed(1)} out of 5` },
                  ]}
                  valueFormat={(v) => `${Math.round(v)}%`}
                  colour="#12a05c"
                />
                <div>
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Deliveries per day (last 14 days)</p>
                  <LineChart data={state.history.slice(-14).map((h, i) => ({ label: h.date.slice(8), value: Math.round((h.deliveries / 9) * (0.85 + ((i % 5) * 0.06))) }))} height={180} />
                </div>
              </div>
            )}
            {tab === "training" && (
              <TableWrap>
                <thead><tr><Th>Course</Th><Th>Status</Th><Th>Completed</Th><Th>Expires</Th></tr></thead>
                <tbody>
                  {driver.training.map((t) => (
                    <Row key={t.course}>
                      <Td className="font-semibold text-navy-950">{t.course}</Td>
                      <Td><StatusBadge status={t.status} /></Td>
                      <Td>{dateSA(t.date)}</Td>
                      <Td>{t.expires ? dateSA(t.expires) : "—"}</Td>
                    </Row>
                  ))}
                </tbody>
              </TableWrap>
            )}
            {tab === "safety" && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Incidents</p>
                  {incidents.length ? (
                    <ul className="divide-y divide-mist-100 rounded-md border border-mist-200">
                      {incidents.map((i) => (
                        <li key={i.id} className="px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold text-navy-950">{i.id} · {i.type}</span>
                            <Badge tone={i.severity === "High" || i.severity === "Critical" ? "critical" : "warning"}>{i.severity}</Badge>
                          </div>
                          <p className="text-[12px] text-charcoal-400">{dateSA(i.date)} {i.time} · {i.location}</p>
                          <p className="mt-1 text-[12.5px] text-charcoal-700">{i.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-charcoal-400">No incidents recorded for this driver.</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Near misses</p>
                  {nearMisses.length ? (
                    <ul className="divide-y divide-mist-100 rounded-md border border-mist-200">
                      {nearMisses.map((n) => (
                        <li key={n.id} className="px-3 py-2.5">
                          <p className="text-[13px] font-semibold text-navy-950">{n.riskType} · {n.location}</p>
                          <p className="text-[12px] text-charcoal-400">{dateSA(n.date)} {n.time}</p>
                          <p className="mt-1 text-[12.5px] text-charcoal-700">{n.description}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-charcoal-400">No near misses reported.</p>
                  )}
                </div>
              </div>
            )}
            {tab === "deliveries" && (
              <TableWrap>
                <thead><tr><Th>Delivery</Th><Th>Destination</Th><Th>Service</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {deliveries.slice(0, 25).map((d) => (
                    <Row key={d.id} onClick={() => setParam("delivery", d.id)}>
                      <Td className="font-semibold text-navy-950">{d.id}</Td>
                      <Td className="max-w-[220px] truncate">{d.destination}, {d.suburb}</Td>
                      <Td>{d.service}</Td>
                      <Td><StatusBadge status={d.status} /></Td>
                    </Row>
                  ))}
                </tbody>
              </TableWrap>
            )}
            {tab === "documents" && (
              <TableWrap>
                <thead><tr><Th>Document</Th><Th>Type</Th><Th>Expires</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {docs.map((d) => (
                    <Row key={d.id}>
                      <Td className="font-semibold text-navy-950">{d.name}</Td><Td>{d.docType}</Td><Td>{dateSA(d.expires)}</Td><Td><StatusBadge status={d.status} /></Td>
                    </Row>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        </Card>
        <IncidentModal open={incidentOpen} onClose={() => setIncidentOpen(false)} defaults={{ driverId: driver.id, vehicleId: driver.vehicleId ?? undefined }} />
        <NearMissModal open={nearMissOpen} onClose={() => setNearMissOpen(false)} defaults={{ driverId: driver.id, vehicleId: driver.vehicleId ?? undefined }} />
        <DeliveryDrawer deliveryId={params.get("delivery")} onClose={() => setParam("delivery", null)} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Drivers"
        description="The Easy Drop driving team — availability, workload, performance, safety and training status."
        actions={<Button variant="secondary" icon="download" onClick={() => downloadCSV("easydrop-drivers.csv", state.drivers.map((d) => ({ id: d.id, name: d.name, status: d.status, vehicle: d.vehicleId, onTime: d.onTimePct, firstAttempt: d.firstAttemptPct, safety: d.safetyScore })))}>Export</Button>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Drivers" value={state.drivers.length} icon="users" />
        <Stat label="On route" value={state.drivers.filter((d) => d.status === "On Route").length} tone="success" icon="truck" />
        <Stat label="Available" value={state.drivers.filter((d) => d.status === "Available").length} icon="user" />
        <Stat label="Off duty / leave" value={state.drivers.filter((d) => d.status === "Off Duty" || d.status === "On Leave").length} tone="warning" icon="calendar" />
        <Stat label="Average safety score" value={Math.round(state.drivers.reduce((s, d) => s + d.safetyScore, 0) / state.drivers.length)} tone="success" icon="shield" />
      </div>
      <Card className="mt-4">
        <CardHeader title="Driver list" subtitle="Click a driver to open their profile" icon="users" />
        <TableWrap>
          <thead>
            <tr><Th>Driver</Th><Th>ID</Th><Th>Status</Th><Th className="hidden md:table-cell">Vehicle</Th><Th>Deliveries today</Th><Th>On-time</Th><Th className="hidden lg:table-cell">First attempt</Th><Th>Safety</Th><Th className="hidden xl:table-cell">Training</Th></tr>
          </thead>
          <tbody>
            {state.drivers.map((d) => {
              const outstanding = d.training.filter((t) => t.status !== "Completed").length;
              return (
                <Row key={d.id} onClick={() => setParam("id", d.id)}>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-navy-950 text-[10.5px] font-bold text-white">{initials(d.name)}</span>
                      <span className="font-semibold text-navy-950">{d.name}</span>
                    </span>
                  </Td>
                  <Td className="num">{d.id}</Td>
                  <Td><StatusBadge status={d.status} /></Td>
                  <Td className="hidden md:table-cell">{d.vehicleId ?? "—"}</Td>
                  <Td className="num">{d.deliveriesToday}</Td>
                  <Td className="num">{pct(d.onTimePct)}</Td>
                  <Td className="num hidden lg:table-cell">{pct(d.firstAttemptPct)}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <Progress value={d.safetyScore} tone={d.safetyScore >= 85 ? "success" : d.safetyScore >= 70 ? "warning" : "critical"} className="w-12" />
                      <span className="num text-[12px]">{d.safetyScore}</span>
                    </span>
                  </Td>
                  <Td className="hidden xl:table-cell">
                    {outstanding ? <Badge tone="warning">{outstanding} outstanding</Badge> : <Badge tone="success">Up to date</Badge>}
                  </Td>
                </Row>
              );
            })}
          </tbody>
        </TableWrap>
      </Card>
    </>
  );
}

/* ====================== TRAINING ====================== */

export function TrainingPage() {
  const { state } = useStore();
  const { navigate } = useRouter();
  const rows = TRAINING_COURSES.map((course) => {
    const records = state.drivers.map((d) => d.training.find((t) => t.course === course));
    return {
      course,
      completed: records.filter((r) => r?.status === "Completed").length,
      pending: records.filter((r) => r?.status === "Pending").length,
      expired: records.filter((r) => r?.status === "Expired").length,
    };
  });
  const compliance = (rows.reduce((s, r) => s + r.completed, 0) / (rows.length * state.drivers.length)) * 100;

  return (
    <>
      <PageHeader title="Driver Training" description="Course completion across the driving team. Expired or pending modules are reassigned by the safety officer." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Training compliance" value={pct(compliance)} tone={compliance >= 90 ? "success" : "warning"} icon="graduation" />
        <Stat label="Courses" value={TRAINING_COURSES.length} icon="file" />
        <Stat label="Pending modules" value={rows.reduce((s, r) => s + r.pending, 0)} tone="warning" icon="clock" />
        <Stat label="Expired modules" value={rows.reduce((s, r) => s + r.expired, 0)} tone="critical" icon="warning" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="Courses" subtitle="Completion by module" icon="graduation" />
          <TableWrap>
            <thead><tr><Th>Course</Th><Th>Completed</Th><Th>Pending</Th><Th>Expired</Th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <Row key={r.course}>
                  <Td className="font-semibold text-navy-950">{r.course}</Td>
                  <Td className="num text-brand-700">{r.completed}</Td>
                  <Td className="num text-amber-700">{r.pending}</Td>
                  <Td className="num text-red-700">{r.expired}</Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        </Card>
        <Card>
          <CardHeader title="Drivers with outstanding training" subtitle="Pending or expired modules" icon="users" />
          <TableWrap>
            <thead><tr><Th>Driver</Th><Th>Outstanding modules</Th><Th /></tr></thead>
            <tbody>
              {state.drivers
                .map((d) => ({ d, outstanding: d.training.filter((t) => t.status !== "Completed") }))
                .filter((x) => x.outstanding.length)
                .map(({ d, outstanding }) => (
                  <Row key={d.id} onClick={() => navigate(`/ops/drivers?id=${d.id}`)}>
                    <Td className="font-semibold text-navy-950">{d.name}</Td>
                    <Td>
                      <span className="flex flex-wrap gap-1">
                        {outstanding.map((t) => (
                          <Badge key={t.course} tone={t.status === "Expired" ? "critical" : "warning"}>{t.course} · {t.status}</Badge>
                        ))}
                      </span>
                    </Td>
                    <Td><Icon name="chevronRight" className="h-4 w-4 text-charcoal-400" /></Td>
                  </Row>
                ))}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}

/* ====================== CUSTOMERS ====================== */

export function CustomersPage({ businessView = false }: { businessView?: boolean }) {
  const { state } = useStore();
  const { params, setParam } = useRouter();
  const [q, setQ] = useState("");
  const customerId = params.get("id");
  const customer = state.customers.find((c) => c.id === customerId);

  if (customer) {
    const stats = customerStats(state, customer.id);
    return (
      <>
        <PageHeader
          title={customer.business}
          description={`${customer.industry} · account ${customer.accountNumber} · customer since ${dateSA(customer.since)}`}
          actions={<Button variant="secondary" icon="chevronLeft" onClick={() => setParam("id", null)}>All customers</Button>}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Stat label="Deliveries today" value={stats.total} icon="package" />
          <Stat label="Completed" value={stats.completed} tone="success" icon="check" />
          <Stat label="Active" value={stats.active} icon="truck" />
          <Stat label="Failed" value={stats.failed} tone={stats.failed ? "warning" : "success"} icon="warning" />
          <Stat label="On-time" value={pct(stats.onTimePct)} tone={stats.onTimePct >= customer.slaTargetPct ? "success" : "warning"} sub={`SLA ${customer.slaTargetPct}%`} icon="clock" />
          <Stat label="Spend today" value={zar(stats.spend)} icon="money" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <Card>
            <CardHeader title="Business profile" icon="briefcase" />
            <div className="p-4">
              <KeyValue
                cols={1}
                items={[
                  ["Business", customer.business],
                  ["Industry", customer.industry],
                  ["Contact", customer.contactName],
                  ["Phone", customer.phone],
                  ["Email", customer.email],
                  ["Pickup locations", customer.pickupLocations.join(" · ")],
                  ["Contract", customer.contract],
                  ["SLA target", `${customer.slaTargetPct}% on-time`],
                  ["Monthly volume", `${num(customer.monthlyVolume)} deliveries`],
                  ["Revenue this month", zar(customer.revenueMtd)],
                  ["Complaints this month", String(customer.complaints)],
                  ["Billing", customer.billingTerms],
                ]}
              />
            </div>
          </Card>
          <Card>
            <CardHeader title="Recent deliveries" subtitle="Today's parcels for this customer" icon="package" />
            <TableWrap>
              <thead><tr><Th>Delivery</Th><Th>Recipient</Th><Th>Destination</Th><Th>Status</Th><Th>Price</Th></tr></thead>
              <tbody>
                {stats.deliveries.slice(0, 20).map((d) => (
                  <Row key={d.id} onClick={() => setParam("delivery", d.id)}>
                    <Td className="font-semibold text-navy-950">{d.id}</Td>
                    <Td>{d.recipient}</Td>
                    <Td className="max-w-[200px] truncate">{d.destination}, {d.suburb}</Td>
                    <Td><StatusBadge status={d.status} /></Td>
                    <Td className="num">{zar(d.price)}</Td>
                  </Row>
                ))}
              </tbody>
            </TableWrap>
          </Card>
        </div>
        <DeliveryDrawer deliveryId={params.get("delivery")} onClose={() => setParam("delivery", null)} />
      </>
    );
  }

  const list = state.customers.filter((c) => (c.business + c.industry + c.contactName).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title={businessView ? "Business Profiles" : "Customers"}
        description={businessView ? "Contracted business accounts, their service levels and commercial terms." : "Business customers booking deliveries with Easy Drop."}
        actions={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="h-9 w-56" aria-label="Search customers" />}
      />
      {businessView ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const stats = customerStats(state, c.id);
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="h-1.5" style={{ background: c.logoTone }} />
                <CardHeader title={c.business} subtitle={`${c.industry} · ${c.contract}`} icon="briefcase" action={<Badge tone={stats.onTimePct >= c.slaTargetPct ? "success" : "warning"}>SLA {c.slaTargetPct}%</Badge>} />
                <div className="space-y-3 p-4">
                  <KeyValue
                    items={[
                      ["Contact", c.contactName],
                      ["Phone", c.phone],
                      ["Monthly volume", num(c.monthlyVolume)],
                      ["Revenue (month)", zar(c.revenueMtd)],
                      ["On-time", pct(c.onTimePct)],
                      ["Complaints", String(c.complaints)],
                    ]}
                  />
                  <Progress value={c.onTimePct} tone={c.onTimePct >= c.slaTargetPct ? "success" : "warning"} />
                  <Button variant="secondary" className="w-full" icon="arrowRight" onClick={() => setParam("id", c.id)}>Open profile</Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader title="Business customers" subtitle="Click a customer to open the account" icon="briefcase" />
          <TableWrap>
            <thead>
              <tr><Th>Business</Th><Th>Industry</Th><Th className="hidden md:table-cell">Contact</Th><Th>Deliveries (month)</Th><Th>Revenue</Th><Th>On-time</Th><Th>Complaints</Th><Th>SLA</Th></tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <Row key={c.id} onClick={() => setParam("id", c.id)}>
                  <Td className="font-semibold text-navy-950">{c.business}</Td>
                  <Td>{c.industry}</Td>
                  <Td className="hidden md:table-cell">{c.contactName}<span className="block text-[11.5px] text-charcoal-400">{c.phone}</span></Td>
                  <Td className="num">{num(c.deliveriesMtd)}</Td>
                  <Td className="num">{zar(c.revenueMtd)}</Td>
                  <Td className={cn("num font-semibold", c.onTimePct >= c.slaTargetPct ? "text-brand-700" : "text-amber-700")}>{pct(c.onTimePct)}</Td>
                  <Td className="num">{c.complaints}</Td>
                  <Td><Badge tone={c.onTimePct >= c.slaTargetPct ? "success" : "warning"}>{c.onTimePct >= c.slaTargetPct ? "Meeting SLA" : "Below SLA"}</Badge></Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
          {!list.length && <EmptyState icon="briefcase" title="No customers found" />}
        </Card>
      )}
    </>
  );
}
