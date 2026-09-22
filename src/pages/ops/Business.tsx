import { useMemo, useState } from "react";
import { BarChart, Donut, HBars, LineChart } from "@/components/charts";
import { Icon } from "@/components/Icon";
import {
  Badge, Banner, Button, Card, CardHeader, Field, Input, KeyValue, PageHeader, Progress, Row, Select, Stat,
  StatusBadge, Tabs, TableWrap, Td, Th,
} from "@/components/ui";
import { downloadCSV, num, pct, zar, zarCompact } from "@/lib/format";
import { useRouter } from "@/router";
import { calcBreakEven, customerStats, financeSummary, fleetSummary, kpiRows, todayStats } from "@/state/selectors";
import { useStore } from "@/state/store";
import { cn } from "@/utils/cn";

/* ====================== KPI CENTRE ====================== */

export function KpiPage() {
  const { state } = useStore();
  const rows = kpiRows(state);
  const meets = (r: (typeof rows)[number]) =>
    r.direction === "up" ? r.current >= r.target : r.direction === "down" ? r.current <= r.target : r.current === r.target;

  return (
    <>
      <PageHeader
        title="KPI Centre"
        description="How the operation is performing against the targets in the business plan. Green means the target is being met."
        actions={<Button variant="secondary" icon="download" onClick={() => downloadCSV("easydrop-kpis.csv", rows.map((r) => ({ kpi: r.name, current: r.current.toFixed(1), target: r.target, unit: r.unit, meeting: meets(r) ? "Yes" : "No" })))}>Export</Button>}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((r) => (
          <Card key={r.name} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] font-semibold text-charcoal-500">{r.name}</p>
              <Badge tone={meets(r) ? "success" : "warning"}>{meets(r) ? "On target" : "Below target"}</Badge>
            </div>
            <p className={cn("num mt-2 text-[28px] font-bold leading-none", meets(r) ? "text-brand-600" : "text-amber-600")}>
              {r.unit === "%" ? pct(r.current, 1) : num(r.current, r.current % 1 ? 1 : 0)}
            </p>
            <p className="mt-1 text-[12px] text-charcoal-400">
              Target {r.direction === "up" ? "≥" : r.direction === "down" ? "≤" : "="} {r.unit === "%" ? pct(r.target) : num(r.target)}
            </p>
            <div className="mt-2">
              <Progress
                value={r.direction === "zero" ? (r.current === 0 ? 100 : 0) : Math.min(100, (r.current / Math.max(0.01, r.target)) * 100)}
                tone={meets(r) ? "success" : "warning"}
              />
            </div>
            <p className="mt-2 text-[11.5px] text-charcoal-400">{r.note}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="On-time delivery trend" subtitle="30 days against the 95% target" icon="clock" />
          <div className="p-4">
            <LineChart data={state.history.map((h) => ({ label: h.date.slice(8), value: h.onTimePct }))} height={200} target={95} targetLabel="Target 95%" valueFormat={(v) => `${v.toFixed(1)}%`} />
          </div>
        </Card>
        <Card>
          <CardHeader title="First-attempt success trend" subtitle="30 days against the 90% target" icon="target" />
          <div className="p-4">
            <LineChart data={state.history.map((h) => ({ label: h.date.slice(8), value: h.firstAttemptPct }))} height={200} target={90} targetLabel="Target 90%" colour="#2b5480" valueFormat={(v) => `${v.toFixed(1)}%`} />
          </div>
        </Card>
      </div>
    </>
  );
}

/* ====================== ANALYTICS + FINANCIALS ====================== */

export function FinancialsPage() {
  const { state } = useStore();
  const [tab, setTab] = useState("dashboard");
  const fin = financeSummary(state);
  const t = todayStats(state);
  const fleet = fleetSummary(state);

  const revenueSeries = state.history.map((h) => ({ label: h.date.slice(8), value: h.revenue }));
  const costSeries = state.history.map((h) => h.costs);

  return (
    <>
      <PageHeader
        title="Financials"
        description="Revenue, costs, vehicle profitability and customer billing for the operation."
        actions={<Button variant="secondary" icon="printer" onClick={() => window.print()}>Print</Button>}
      />
      <div className="mb-4">
        <Banner tone="warning" icon="info" title="ILLUSTRATIVE DEMO DATA">
          The figures on this page are illustrative for the purposes of this demonstration. They are NOT actual company
          financial results.
        </Banner>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Monthly revenue" value={zarCompact(fin.revenue)} tone="success" icon="money" />
        <Stat label="Operating costs" value={zarCompact(fin.costs)} tone="warning" icon="calculator" />
        <Stat label="Contribution" value={zarCompact(fin.contribution)} tone="success" sub={pct(fin.marginPct) + " margin"} icon="activity" />
        <Stat label="Avg revenue / delivery" value={zar(fin.avgRevenuePerDelivery)} icon="package" />
        <Stat label="Est. cost / delivery" value={zar(fin.avgCostPerDelivery)} icon="truck" />
      </div>

      <Card className="mt-4">
        <Tabs
          className="px-3"
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "dashboard", label: "Financial dashboard" },
            { key: "revenue", label: "Revenue" },
            { key: "costs", label: "Costs" },
            { key: "vehicles", label: "Vehicle profitability" },
            { key: "billing", label: "Customer billing" },
          ]}
        />
        <div className="p-4">
          {tab === "dashboard" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Revenue vs costs (30 days)</p>
                <BarChart data={revenueSeries} compare={costSeries} height={210} valueFormat={(v) => zarCompact(v)} compareColour="#d97706" />
                <p className="mt-2 text-[11.5px] text-charcoal-400">Green = revenue · Amber = costs</p>
              </div>
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Cost structure (monthly)</p>
                <Donut segments={fin.costLines.slice(0, 6).map((c) => ({ label: c.name, value: c.value }))} centreValue={zarCompact(fin.costs)} centreLabel="monthly costs" />
              </div>
              <div className="lg:col-span-2">
                <KeyValue
                  cols={3}
                  items={[
                    ["Deliveries today", num(t.total)],
                    ["Revenue today", zar(t.revenue)],
                    ["Estimated cost today", zar(t.completed * fin.avgCostPerDelivery)],
                    ["Contribution today", zar(t.revenue - t.completed * fin.avgCostPerDelivery)],
                    ["Active vehicles", `${fleet.active} / ${fleet.total}`],
                    ["Revenue per active vehicle (month)", zar(fin.revenue / Math.max(1, fleet.total))],
                  ]}
                />
              </div>
            </div>
          )}

          {tab === "revenue" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Revenue by customer (month to date)</p>
                <HBars data={state.customers.map((c) => ({ label: c.business, value: c.revenueMtd, colour: c.logoTone }))} valueFormat={(v) => zar(v)} />
              </div>
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Revenue by service (today)</p>
                <HBars
                  data={["Standard Local", "Extended Urban", "Same-Day Priority", "Scheduled Route", "Reverse Logistics"].map((s) => ({
                    label: s,
                    value: state.deliveries.filter((d) => d.service === s).reduce((sum, d) => sum + d.price, 0),
                  }))}
                  valueFormat={(v) => zar(v)}
                  colour="#12a05c"
                />
              </div>
            </div>
          )}

          {tab === "costs" && (
            <div className="grid gap-4 lg:grid-cols-2">
              <TableWrap>
                <thead><tr><Th>Cost line</Th><Th>Monthly</Th><Th>% of costs</Th><Th>Per delivery</Th></tr></thead>
                <tbody>
                  {fin.costLines.map((c) => (
                    <Row key={c.name}>
                      <Td className="font-semibold text-navy-950">{c.name}</Td>
                      <Td className="num">{zar(c.value)}</Td>
                      <Td className="num">{pct((c.value / fin.costs) * 100, 1)}</Td>
                      <Td className="num">{zar(c.value / 13500, 2)}</Td>
                    </Row>
                  ))}
                  <Row className="bg-mist-50">
                    <Td className="font-bold text-navy-950">Total operating costs</Td>
                    <Td className="num font-bold">{zar(fin.costs)}</Td>
                    <Td className="num font-bold">100%</Td>
                    <Td className="num font-bold">{zar(fin.avgCostPerDelivery)}</Td>
                  </Row>
                </tbody>
              </TableWrap>
              <HBars data={fin.costLines.map((c) => ({ label: c.name, value: c.value }))} valueFormat={(v) => zar(v)} colour="#d97706" />
            </div>
          )}

          {tab === "vehicles" && (
            <TableWrap>
              <thead><tr><Th>Vehicle</Th><Th>Deliveries (month)</Th><Th>Revenue</Th><Th>Costs</Th><Th>Contribution</Th><Th>Margin</Th><Th>Utilisation</Th></tr></thead>
              <tbody>
                {state.vehicles.map((v) => {
                  const profit = v.revenueMtd - v.costsMtd;
                  return (
                    <Row key={v.id}>
                      <Td className="font-semibold text-navy-950">{v.id}</Td>
                      <Td className="num">{num(v.deliveriesMtd)}</Td>
                      <Td className="num">{zar(v.revenueMtd)}</Td>
                      <Td className="num">{zar(v.costsMtd)}</Td>
                      <Td className={cn("num font-semibold", profit > 0 ? "text-brand-700" : "text-red-700")}>{zar(profit)}</Td>
                      <Td className="num">{pct((profit / Math.max(1, v.revenueMtd)) * 100)}</Td>
                      <Td><span className="flex items-center gap-2"><Progress value={v.utilisationPct} className="w-14" /><span className="num text-[12px]">{v.utilisationPct}%</span></span></Td>
                    </Row>
                  );
                })}
              </tbody>
            </TableWrap>
          )}

          {tab === "billing" && (
            <TableWrap>
              <thead><tr><Th>Customer</Th><Th>Account</Th><Th>Contract</Th><Th>Deliveries (month)</Th><Th>Invoice value</Th><Th>Terms</Th><Th>Status</Th></tr></thead>
              <tbody>
                {state.customers.map((c) => (
                  <Row key={c.id}>
                    <Td className="font-semibold text-navy-950">{c.business}</Td>
                    <Td className="num">{c.accountNumber}</Td>
                    <Td>{c.contract}</Td>
                    <Td className="num">{num(c.deliveriesMtd)}</Td>
                    <Td className="num">{zar(c.revenueMtd)}</Td>
                    <Td>{c.billingTerms}</Td>
                    <Td><StatusBadge status={c.complaints > 5 ? "Under Review" : "Active"} /></Td>
                  </Row>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      </Card>
    </>
  );
}

/* ====================== BREAK-EVEN ====================== */

const FIELDS: { key: keyof ReturnType<typeof defaultInputs>; label: string; hint?: string; step?: number }[] = [
  { key: "vehicles", label: "Vehicles in the fleet" },
  { key: "operatingDays", label: "Operating days per month" },
  { key: "deliveriesPerVehicleDay", label: "Deliveries per vehicle per day", hint: "Business plan band: 35 – 50" },
  { key: "revenuePerDelivery", label: "Average revenue per delivery (R)" },
  { key: "driverCostPerVehicle", label: "Driver cost per vehicle (R/month)" },
  { key: "fuelPerVehicle", label: "Fuel & energy per vehicle (R/month)" },
  { key: "maintenancePerVehicle", label: "Maintenance per vehicle (R/month)" },
  { key: "insurancePerVehicle", label: "Insurance per vehicle (R/month)" },
  { key: "financePerVehicle", label: "Vehicle finance per vehicle (R/month)" },
  { key: "depotCosts", label: "Depot & hub costs (R/month)" },
  { key: "otherCosts", label: "Other fixed costs (R/month)" },
];

const defaultInputs = () => ({
  vehicles: 10, operatingDays: 26, deliveriesPerVehicleDay: 42, revenuePerDelivery: 40,
  driverCostPerVehicle: 9800, fuelPerVehicle: 3400, maintenancePerVehicle: 1900, insurancePerVehicle: 1250,
  financePerVehicle: 3100, depotCosts: 48000, otherCosts: 26000,
});

export function BreakEvenPage() {
  const { state, dispatch } = useStore();
  const inputs = state.breakEven;
  const result = useMemo(() => calcBreakEven(inputs), [inputs]);

  const scenario = useMemo(() => {
    const out: { label: string; value: number }[] = [];
    for (let d = 20; d <= 60; d += 5) {
      const r = calcBreakEven({ ...inputs, deliveriesPerVehicleDay: d });
      out.push({ label: `${d}`, value: Math.round(r.contribution) });
    }
    return out;
  }, [inputs]);

  return (
    <>
      <PageHeader
        title="Break-even Calculator"
        description="Change any input to see how many deliveries the operation needs to cover its costs. Everything recalculates immediately."
        actions={<Button variant="secondary" icon="refresh" onClick={() => dispatch({ type: "SET_BREAKEVEN", patch: defaultInputs() })}>Reset to plan</Button>}
      />
      <div className="mb-4">
        <Banner tone="warning" icon="info" title="ILLUSTRATIVE DEMO DATA">
          These inputs are modelling assumptions for demonstration purposes only — not actual company financial results.
        </Banner>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader title="Inputs" subtitle="Adjust the operating assumptions" icon="calculator" />
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
            {FIELDS.map((f) => (
              <Field key={String(f.key)} label={f.label} hint={f.hint}>
                <Input
                  type="number"
                  min={0}
                  value={inputs[f.key]}
                  onChange={(e) => dispatch({ type: "SET_BREAKEVEN", patch: { [f.key]: Number(e.target.value) } })}
                />
              </Field>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Monthly deliveries" value={num(result.monthlyDeliveries)} icon="package" />
            <Stat label="Monthly revenue" value={zarCompact(result.revenue)} tone="success" icon="money" />
            <Stat label="Monthly costs" value={zarCompact(result.totalCosts)} tone="warning" icon="calculator" />
            <Stat label="Contribution" value={zarCompact(result.contribution)} tone={result.contribution >= 0 ? "success" : "critical"} sub={pct(result.marginPct) + " margin"} icon="activity" />
          </div>

          <Card>
            <CardHeader title="Results" subtitle="What these assumptions produce" icon="target" />
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <KeyValue
                cols={1}
                items={[
                  ["Monthly deliveries", num(result.monthlyDeliveries)],
                  ["Revenue", zar(result.revenue)],
                  ["Variable (per-vehicle) costs", zar(result.variableCosts)],
                  ["Fixed costs", zar(result.fixedCosts)],
                  ["Total costs", zar(result.totalCosts)],
                  ["Contribution", <span className={result.contribution >= 0 ? "text-brand-700" : "text-red-700"}>{zar(result.contribution)}</span>],
                  ["Contribution per vehicle", zar(result.contributionPerVehicle)],
                  ["Cost per delivery", zar(result.costPerDelivery, 2)],
                  ["Break-even deliveries per month", num(Math.ceil(result.breakEvenDeliveries))],
                  ["Break-even per vehicle per day", num(result.breakEvenPerVehicleDay, 1)],
                ]}
              />
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">
                  Contribution at different delivery volumes
                </p>
                <BarChart data={scenario} height={200} valueFormat={(v) => zarCompact(v)} colour="#2b5480" />
                <p className="mt-2 text-[11.5px] text-charcoal-400">Deliveries per vehicle per day →</p>
                <div className="mt-3 rounded-md border border-mist-200 bg-mist-50 p-3 text-[13px] text-charcoal-700">
                  At {inputs.deliveriesPerVehicleDay} deliveries per vehicle per day across {inputs.vehicles} vehicles,
                  the operation {result.contribution >= 0 ? "covers its costs and contributes" : "does not yet cover its costs — it is short by"}{" "}
                  <span className="font-bold">{zar(Math.abs(result.contribution))}</span> per month. Break-even needs about{" "}
                  <span className="font-bold">{num(result.breakEvenPerVehicleDay, 1)}</span> deliveries per vehicle per day.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/* ====================== REPORTS ====================== */

const REPORTS = [
  { key: "daily", name: "Daily Operations Report", desc: "Volume, completion, exceptions and fleet status for the day.", icon: "dashboard" },
  { key: "delivery", name: "Delivery Report", desc: "Every delivery with customer, driver, vehicle, status and price.", icon: "package" },
  { key: "fleet", name: "Fleet Report", desc: "Vehicle status, mileage, utilisation, inspections and maintenance.", icon: "truck" },
  { key: "driver", name: "Driver Report", desc: "Workload, on-time, first-attempt, safety and training per driver.", icon: "users" },
  { key: "customer", name: "Customer Report", desc: "Volume, revenue, on-time and complaints per business customer.", icon: "briefcase" },
  { key: "financial", name: "Financial Report", desc: "Revenue, costs, contribution and vehicle profitability.", icon: "money" },
  { key: "kpi", name: "KPI Report", desc: "Every business-plan KPI with current value and target.", icon: "target" },
  { key: "safety", name: "Safety Report", desc: "Incidents, near misses, inspections and corrective actions.", icon: "shield" },
];

export function ReportsPage() {
  const { state } = useStore();
  const { params, setParam } = useRouter();
  const [range, setRange] = useState("30");
  const key = params.get("r");
  const report = REPORTS.find((r) => r.key === key);
  const fin = financeSummary(state);
  const t = todayStats(state);

  const rows: Record<string, Record<string, unknown>[]> = {
    daily: state.history.slice(-Number(range)).map((h) => ({
      Date: h.date, Deliveries: h.deliveries, Completed: h.completed, Failed: h.failed,
      "On-time %": h.onTimePct.toFixed(1), "First attempt %": h.firstAttemptPct.toFixed(1),
      Revenue: h.revenue, Costs: h.costs, "Distance (km)": h.distanceKm,
    })),
    delivery: state.deliveries.slice(0, 120).map((d) => ({
      Delivery: d.id, Customer: state.customers.find((c) => c.id === d.customerId)?.business ?? "",
      Recipient: d.recipient, Suburb: d.suburb, Service: d.service, Priority: d.priority,
      Driver: state.drivers.find((x) => x.id === d.driverId)?.name ?? "", Vehicle: d.vehicleId ?? "",
      Status: d.status, Price: d.price,
    })),
    fleet: state.vehicles.map((v) => ({
      Vehicle: v.id, Registration: v.registration, Model: v.model, Status: v.status,
      "Mileage (km)": v.mileageKm, "Utilisation %": v.utilisationPct, "Last inspection": v.lastInspection,
      "Next service": v.nextServiceDate, "Revenue (month)": v.revenueMtd, "Costs (month)": v.costsMtd,
    })),
    driver: state.drivers.map((d) => ({
      Driver: d.name, ID: d.id, Status: d.status, Vehicle: d.vehicleId ?? "", "Deliveries today": d.deliveriesToday,
      "On-time %": d.onTimePct, "First attempt %": d.firstAttemptPct, "Safety score": d.safetyScore,
      Incidents: d.incidents, "Near misses": d.nearMisses,
    })),
    customer: state.customers.map((c) => {
      const s = customerStats(state, c.id);
      return {
        Customer: c.business, Industry: c.industry, "Deliveries today": s.total, "Completed today": s.completed,
        "Deliveries (month)": c.deliveriesMtd, "Revenue (month)": c.revenueMtd, "On-time %": c.onTimePct,
        Complaints: c.complaints, "SLA target %": c.slaTargetPct,
      };
    }),
    financial: [
      { Line: "Revenue (monthly)", Value: fin.revenue },
      { Line: "Operating costs (monthly)", Value: fin.costs },
      { Line: "Contribution", Value: fin.contribution },
      { Line: "Average revenue per delivery", Value: fin.avgRevenuePerDelivery },
      { Line: "Estimated cost per delivery", Value: fin.avgCostPerDelivery },
      ...fin.costLines.map((c) => ({ Line: `Cost — ${c.name}`, Value: c.value })),
    ],
    kpi: kpiRows(state).map((r) => ({ KPI: r.name, Current: r.current.toFixed(1), Target: r.target, Unit: r.unit, Note: r.note })),
    safety: [
      ...state.incidents.map((i) => ({ Type: "Incident", Reference: i.id, Date: i.date, Detail: `${i.type} · ${i.location}`, Severity: i.severity, Status: i.status })),
      ...state.nearMisses.map((n) => ({ Type: "Near miss", Reference: n.id, Date: n.date, Detail: `${n.riskType} · ${n.location}`, Severity: "—", Status: "Logged" })),
    ],
  };

  if (report) {
    const data = rows[report.key] ?? [];
    const headers = data.length ? Object.keys(data[0]) : [];
    return (
      <>
        <PageHeader
          title={report.name}
          description={report.desc}
          actions={
            <>
              <Button variant="secondary" icon="chevronLeft" onClick={() => setParam("r", null)}>Reports centre</Button>
              {report.key === "daily" && (
                <Select value={range} onChange={(e) => setRange(e.target.value)} options={[{ value: "7", label: "Last 7 days" }, { value: "14", label: "Last 14 days" }, { value: "30", label: "Last 30 days" }]} className="h-10 w-40" />
              )}
              <Button variant="secondary" icon="printer" onClick={() => window.print()}>Print</Button>
              <Button variant="primary" icon="download" onClick={() => downloadCSV(`easydrop-${report.key}-report.csv`, data)}>Export CSV</Button>
            </>
          }
        />
        <Card>
          <CardHeader title={`${report.name} — generated ${new Date().toLocaleString("en-ZA")}`} subtitle={`${data.length} rows · demo environment, simulated data`} icon={report.icon} />
          <TableWrap>
            <thead><tr>{headers.map((h) => <Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {data.map((r, i) => (
                <Row key={i}>
                  {headers.map((h) => (
                    <Td key={h} className={typeof r[h] === "number" ? "num" : ""}>
                      {typeof r[h] === "number" && /revenue|cost|value|price/i.test(h) ? zar(r[h] as number) : String(r[h] ?? "")}
                    </Td>
                  ))}
                </Row>
              ))}
            </tbody>
          </TableWrap>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Reports Centre" description="Generate, filter, print or export any operational report. All reports read from the same live demo data." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Deliveries today" value={num(t.total)} icon="package" />
        <Stat label="Completed" value={num(t.completed)} tone="success" icon="check" />
        <Stat label="On-time" value={pct(t.onTimePct)} icon="clock" />
        <Stat label="Revenue today" value={zar(t.revenue)} tone="success" icon="money" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORTS.map((r) => (
          <Card key={r.key} className="flex flex-col p-5">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-navy-950 text-brand-400">
              <Icon name={r.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-[15px] font-bold text-navy-950">{r.name}</h3>
            <p className="mt-1 flex-1 text-[13px] text-charcoal-500">{r.desc}</p>
            <Button variant="secondary" className="mt-3 w-full" icon="arrowRight" onClick={() => setParam("r", r.key)}>Open report</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
