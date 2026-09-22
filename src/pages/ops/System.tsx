import { useMemo, useState } from "react";
import { Donut } from "@/components/charts";
import { Icon } from "@/components/Icon";
import {
  Badge, Banner, Button, Card, CardHeader, EmptyState, Field, Input, KeyValue, PageHeader, Progress, Row, Select,
  Stat, StatusBadge, Tabs, TableWrap, Td, Th, Toggle,
} from "@/components/ui";
import { DemoControls } from "@/layouts/AppShell";
import { dateSA, daysUntil, downloadCSV, num, pct, relTime } from "@/lib/format";
import { useRouter } from "@/router";
import { globalSearch } from "@/state/selectors";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

/* ====================== COMPLIANCE ====================== */

export function CompliancePage() {
  const { state } = useStore();
  const { navigate } = useRouter();
  const [tab, setTab] = useState("vehicles");
  const docs = state.documents;
  const expired = docs.filter((d) => d.status === "Expired");
  const expiring = docs.filter((d) => d.status === "Expiring Soon");
  const compliancePct = ((docs.length - expired.length) / Math.max(1, docs.length)) * 100;

  return (
    <>
      <PageHeader
        title="Compliance"
        description="Simulated registration, roadworthy, insurance, licence and training records with expiry tracking."
        actions={<Button variant="secondary" icon="folder" onClick={() => navigate("/ops/documents")}>All documents</Button>}
      />
      <div className="mb-4">
        <Banner tone="info" icon="info" title="Simulated compliance records">
          These records are demonstration data. No legal certification is claimed or implied.
        </Banner>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Documents tracked" value={docs.length} icon="folder" />
        <Stat label="Valid" value={docs.filter((d) => d.status === "Valid").length} tone="success" icon="check" />
        <Stat label="Expiring within 45 days" value={expiring.length} tone="warning" icon="clock" />
        <Stat label="Expired" value={expired.length} tone={expired.length ? "critical" : "success"} icon="warning" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader title="Compliance health" subtitle="Share of documents that are valid" icon="badge" />
          <div className="p-4">
            <Donut
              segments={[
                { label: "Valid", value: docs.filter((d) => d.status === "Valid").length, colour: "#12a05c" },
                { label: "Expiring soon", value: expiring.length, colour: "#d97706" },
                { label: "Expired", value: expired.length, colour: "#dc2626" },
              ]}
              centreValue={pct(compliancePct)}
              centreLabel="compliant"
            />
          </div>
        </Card>
        <Card>
          <Tabs className="px-3" active={tab} onChange={setTab} tabs={[{ key: "vehicles", label: "Vehicle compliance" }, { key: "drivers", label: "Driver compliance" }]} />
          <TableWrap>
            <thead><tr><Th>{tab === "vehicles" ? "Vehicle" : "Driver"}</Th><Th>Document</Th><Th>Expires</Th><Th>Days left</Th><Th>Status</Th></tr></thead>
            <tbody>
              {docs
                .filter((d) => (tab === "vehicles" ? d.entityType === "Vehicle" : d.entityType === "Driver"))
                .sort((a, b) => a.expires.localeCompare(b.expires))
                .slice(0, 24)
                .map((d) => {
                  const left = daysUntil(d.expires);
                  return (
                    <Row key={d.id} onClick={() => navigate(d.entityType === "Vehicle" ? `/ops/vehicles?id=${d.entityId}` : `/ops/drivers?id=${d.entityId}`)}>
                      <Td className="font-semibold text-navy-950">{d.entityName}</Td>
                      <Td>{d.docType}</Td>
                      <Td>{dateSA(d.expires)}</Td>
                      <Td className={cn("num", left < 0 ? "text-red-700" : left < 45 ? "text-amber-700" : "text-charcoal-500")}>{left < 0 ? `${Math.abs(left)} overdue` : left}</Td>
                      <Td><StatusBadge status={d.status} /></Td>
                    </Row>
                  );
                })}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </>
  );
}

export function DocumentsPage() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const types = ["All", ...Array.from(new Set(state.documents.map((d) => d.docType)))];
  const docs = state.documents.filter(
    (d) => (type === "All" || d.docType === type) && (d.name + d.entityName + d.docType).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Documents"
        description="Every simulated compliance document held for vehicles, drivers and the company."
        actions={
          <Button variant="secondary" icon="download" onClick={() => downloadCSV("easydrop-documents.csv", docs.map((d) => ({ entity: d.entityName, document: d.name, type: d.docType, issued: d.issued, expires: d.expires, status: d.status })))}>
            Export
          </Button>
        }
      />
      <Card>
        <CardHeader
          title="Document register"
          subtitle={`${docs.length} documents`}
          icon="folder"
          action={
            <>
              <Select value={type} onChange={(e) => setType(e.target.value)} options={types.map((t) => ({ value: t, label: t }))} className="h-8 w-40" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="h-8 w-52" aria-label="Search documents" />
            </>
          }
        />
        <TableWrap>
          <thead><tr><Th>Owner</Th><Th>Document</Th><Th>Type</Th><Th className="hidden md:table-cell">Issued</Th><Th>Expires</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>
            {docs.map((d) => (
              <Row key={d.id}>
                <Td className="font-semibold text-navy-950">{d.entityName}<span className="block text-[11px] text-charcoal-400">{d.entityType}</span></Td>
                <Td>{d.name}</Td>
                <Td>{d.docType}</Td>
                <Td className="hidden md:table-cell">{dateSA(d.issued)}</Td>
                <Td>{dateSA(d.expires)}</Td>
                <Td><StatusBadge status={d.status} /></Td>
                <Td><Button size="xs" variant="ghost" icon="download" onClick={() => alert(`Simulated download: ${d.name}`)}>PDF</Button></Td>
              </Row>
            ))}
          </tbody>
        </TableWrap>
        {!docs.length && <EmptyState icon="folder" title="No documents found" message="Try a different filter or search." />}
      </Card>
    </>
  );
}

/* ====================== NOTIFICATIONS ====================== */

export function NotificationsPage() {
  const { state, dispatch } = useStore();
  const { navigate } = useRouter();
  const [tab, setTab] = useState("all");
  const list = state.notifications.filter((n) => (tab === "all" ? true : tab === "unread" ? !n.read : n.read));

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Everything the platform wants you to know — deliveries, drivers, vehicles, safety and compliance."
        actions={<Button variant="secondary" icon="check" onClick={() => dispatch({ type: "MARK_ALL_READ" })}>Mark all read</Button>}
      />
      <Card>
        <Tabs
          className="px-3"
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "all", label: "All", count: state.notifications.length },
            { key: "unread", label: "Unread", count: state.notifications.filter((n) => !n.read).length },
            { key: "read", label: "Read", count: state.notifications.filter((n) => n.read).length },
          ]}
        />
        {list.length === 0 ? (
          <EmptyState icon="bell" title="Nothing here" message="Notifications will appear as the operation runs." />
        ) : (
          <ul className="divide-y divide-mist-100">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => { dispatch({ type: "MARK_READ", id: n.id }); navigate(n.link); }}
                  className={cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-mist-50", !n.read && "bg-brand-50/40")}
                >
                  <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    n.tone === "critical" ? "bg-red-100 text-red-700" : n.tone === "warning" ? "bg-amber-100 text-amber-700" : n.tone === "success" ? "bg-brand-100 text-brand-700" : "bg-sky-100 text-sky-700")}>
                    <Icon name={n.kind === "safety" ? "shield" : n.kind === "maintenance" ? "wrench" : n.kind === "vehicle" ? "truck" : n.kind === "compliance" ? "badge" : n.kind === "route" ? "route" : "package"} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[13.5px] font-semibold text-navy-950">{n.title}</span>
                      <span className="text-[11.5px] text-charcoal-400">{relTime(n.at)}</span>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-charcoal-500">{n.message}</span>
                  </span>
                  {!n.read && <Badge tone="success">New</Badge>}
                  <Icon name="chevronRight" className="mt-1 h-4 w-4 shrink-0 text-charcoal-400" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

/* ====================== GLOBAL SEARCH ====================== */

export function SearchPage() {
  const { state } = useStore();
  const { params, setParam, navigate } = useRouter();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const hits = useMemo(() => globalSearch(state, q), [state, q]);
  const groups = useMemo(() => {
    const m = new Map<string, typeof hits>();
    hits.forEach((h) => m.set(h.type, [...(m.get(h.type) ?? []), h]));
    return Array.from(m.entries());
  }, [hits]);

  return (
    <>
      <PageHeader title="Search" description="Find any delivery, vehicle, driver, customer, route, incident or document." />
      <Card className="mb-4">
        <form
          className="flex flex-col gap-2 p-3 sm:flex-row"
          onSubmit={(e) => { e.preventDefault(); setParam("q", input); }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. DW-10023, 3W-004, Thabo, Sandton, ABC Retail" aria-label="Search everything" />
          <Button type="submit" variant="primary" icon="search">Search</Button>
        </form>
      </Card>

      {!q ? (
        <Card><EmptyState icon="search" title="Start typing to search" message="Search across every record in the platform." /></Card>
      ) : hits.length === 0 ? (
        <Card><EmptyState icon="search" title={`No results for “${q}”`} message="Check the spelling or try a shorter search." /></Card>
      ) : (
        <div className="space-y-4">
          {groups.map(([type, list]) => (
            <Card key={type}>
              <CardHeader title={type} subtitle={`${list.length} result${list.length > 1 ? "s" : ""}`} icon={type === "Delivery" ? "package" : type === "Vehicle" ? "truck" : type === "Driver" ? "user" : type === "Customer" ? "briefcase" : type === "Route" ? "route" : type === "Incident" ? "shield" : "folder"} />
              <ul className="divide-y divide-mist-100">
                {list.slice(0, 12).map((h) => (
                  <li key={h.type + h.id}>
                    <button onClick={() => navigate(h.link)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-mist-50">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-semibold text-navy-950">{h.title}</span>
                        <span className="block truncate text-[12px] text-charcoal-400">{h.subtitle}</span>
                      </span>
                      <Icon name="chevronRight" className="h-4 w-4 text-charcoal-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ====================== USERS ====================== */

export function UsersPage() {
  const { state, dispatch, toast } = useStore();
  const roles = ["ADMIN", "OPERATIONS", "DISPATCHER", "DRIVER", "BUSINESS CUSTOMER"] as const;

  return (
    <>
      <PageHeader title="Users" description="Simulated platform users and their roles. Switching the active demo role changes what the platform shows." />
      <div className="mb-4">
        <Banner tone="info" icon="lock" title="Simulated access control">
          Authentication is not implemented in this demo. Roles are illustrative and are used to switch between the
          operations, driver and customer experiences.
        </Banner>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Platform users" subtitle={`${state.users.length} users`} icon="user" />
          <TableWrap>
            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Linked record</Th><Th>Status</Th><Th>Last active</Th></tr></thead>
            <tbody>
              {state.users.map((u) => (
                <Row key={u.id}>
                  <Td className="font-semibold text-navy-950">{u.name}</Td>
                  <Td>{u.email}</Td>
                  <Td><Badge tone="navy">{u.role}</Badge></Td>
                  <Td>{u.linkedId ?? "—"}</Td>
                  <Td><StatusBadge status={u.status} /></Td>
                  <Td>{u.lastActive}</Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        </Card>
        <Card>
          <CardHeader title="Active demo role" subtitle="Changes the experience you see" icon="settings" />
          <div className="space-y-2 p-4">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => { dispatch({ type: "SET_SESSION", patch: { role: r } }); toast({ tone: "info", title: `Role switched to ${r}` }); }}
                className={cn("flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left text-[13.5px] font-semibold",
                  state.session.role === r ? "border-brand-500 bg-brand-50 text-navy-950" : "border-mist-200 bg-white text-charcoal-700 hover:bg-mist-50")}
              >
                {r}
                {state.session.role === r && <Icon name="check" className="h-4 w-4 text-brand-600" />}
              </button>
            ))}
            <p className="pt-2 text-[12px] text-charcoal-400">
              Use the experience switcher in the top bar to move between the operations platform, the driver application
              and the customer portal.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ====================== SETTINGS ====================== */

export function SettingsPage() {
  const { state, dispatch, toast } = useStore();
  const s = state.settings;
  const [tab, setTab] = useState("company");
  const set = (patch: Partial<typeof s>) => dispatch({ type: "UPDATE_SETTINGS", patch });

  return (
    <>
      <PageHeader title="Settings" description="Company details, operating rules, notification preferences and demo environment controls." />
      <Card>
        <Tabs
          className="px-3"
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "company", label: "Company" },
            { key: "operations", label: "Operations" },
            { key: "notifications", label: "Notifications" },
            { key: "account", label: "Account" },
            { key: "appearance", label: "Appearance" },
            { key: "demo", label: "Demo environment" },
          ]}
        />
        <div className="p-4">
          {tab === "company" && (
            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <Field label="Company name"><Input value={s.companyName} onChange={(e) => set({ companyName: e.target.value })} /></Field>
              <Field label="Registration number (simulated)"><Input value={s.registration} onChange={(e) => set({ registration: e.target.value })} /></Field>
              <Field label="Depot"><Input value={s.depot} onChange={(e) => set({ depot: e.target.value })} /></Field>
              <Field label="Operating hours"><Input value={s.operatingHours} onChange={(e) => set({ operatingHours: e.target.value })} /></Field>
              <Field label="Currency"><Select value={s.currency} onChange={(e) => set({ currency: e.target.value })} options={[{ value: "ZAR (R)", label: "ZAR (R)" }]} /></Field>
              <Field label="Distance unit"><Select value={s.distanceUnit} onChange={(e) => set({ distanceUnit: e.target.value })} options={[{ value: "Kilometres (km)", label: "Kilometres (km)" }]} /></Field>
              <div className="sm:col-span-2">
                <Button variant="primary" icon="check" onClick={() => toast({ tone: "success", title: "Company settings saved" })}>Save changes</Button>
              </div>
            </div>
          )}
          {tab === "operations" && (
            <div className="max-w-2xl divide-y divide-mist-100">
              <Toggle checked={s.autoAssign} onChange={(v) => set({ autoAssign: v })} label="Suggest a route automatically" description="Match new deliveries to the closest route by suburb." />
              <Toggle checked={s.requireInspection} onChange={(v) => set({ requireInspection: v })} label="Require a passed inspection before dispatch" description="Vehicles that fail a critical inspection item are blocked." />
              <Toggle checked={s.podPhotoRequired} onChange={(v) => set({ podPhotoRequired: v })} label="Require a photo with proof of delivery" description="Drivers must capture a photo in addition to a signature." />
            </div>
          )}
          {tab === "notifications" && (
            <div className="max-w-2xl divide-y divide-mist-100">
              <Toggle checked={s.notifyDeliveryCreated} onChange={(v) => set({ notifyDeliveryCreated: v })} label="New delivery created" description="Notify operations when a customer books a delivery." />
              <Toggle checked={s.notifySafety} onChange={(v) => set({ notifySafety: v })} label="Safety incidents and near misses" description="Notify the safety officer immediately." />
              <Toggle checked={s.notifyMaintenance} onChange={(v) => set({ notifyMaintenance: v })} label="Maintenance and inspection alerts" description="Notify the fleet controller when a vehicle needs attention." />
            </div>
          )}
          {tab === "account" && (
            <div className="max-w-2xl">
              <KeyValue
                items={[
                  ["Signed in as", "John Mahlangu"],
                  ["Email", "john@easydrop.co.za"],
                  ["Role", state.session.role],
                  ["Depot", s.depot],
                  ["Session", "Simulated — no authentication in this demo"],
                  ["Data storage", "Browser local storage only"],
                ]}
              />
            </div>
          )}
          {tab === "appearance" && (
            <div className="max-w-xl space-y-4">
              <Field label="Table density" hint="Compact fits more rows on screen.">
                <Select value={s.density} onChange={(e) => set({ density: e.target.value as "Comfortable" | "Compact" })} options={[{ value: "Comfortable", label: "Comfortable" }, { value: "Compact", label: "Compact" }]} />
              </Field>
              <div className="rounded-md border border-mist-200 p-4">
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Brand palette</p>
                <div className="flex flex-wrap gap-2">
                  {[["Deep navy", "#081120"], ["Professional green", "#12a05c"], ["Amber", "#d97706"], ["Red", "#dc2626"], ["Light grey", "#f1f4f8"], ["Charcoal", "#2a3340"]].map(([n, c]) => (
                    <div key={n} className="w-28">
                      <div className="h-10 rounded border border-mist-200" style={{ background: c }} />
                      <p className="mt-1 text-[11.5px] text-charcoal-500">{n}</p>
                      <p className="num text-[10.5px] text-charcoal-400">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {tab === "demo" && (
            <div className="max-w-2xl space-y-4">
              <Banner tone="navy" icon="signal" title="DEMO ENVIRONMENT — SIMULATED DATA">
                Nothing on this platform connects to live systems. Generate activity, simulate vehicle movement or reset
                to the original seed data at any time.
              </Banner>
              <DemoControls />
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Deliveries in memory" value={num(state.deliveries.length)} icon="package" />
                <Stat label="Notifications" value={state.notifications.length} icon="bell" />
                <Stat label="Activities logged" value={state.activities.length} icon="activity" />
              </div>
              <div className="rounded-md border border-mist-200 p-4 text-[13px] text-charcoal-500">
                <p className="font-semibold text-navy-950">What each control does</p>
                <ul className="mt-2 space-y-1.5">
                  <li><strong>Generate</strong> — creates a new booking and completes an in-transit delivery with proof of delivery.</li>
                  <li><strong>Simulate movement</strong> — moves vehicle markers along their routes every 1.2 seconds.</li>
                  <li><strong>Reset demo</strong> — clears local storage and restores the original seed data.</li>
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Local storage use</p>
                <Progress value={Math.min(100, (JSON.stringify(state).length / 5_000_000) * 100)} />
                <p className="mt-1 text-[11.5px] text-charcoal-400">{num(JSON.stringify(state).length / 1024)} KB of simulated data held in this browser.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
