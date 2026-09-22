import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { useMemo, useState } from "https://esm.sh/react@19.2.6";
import { BarChart, Donut, HBars, LineChart } from "./../../components/charts.js";
import { Icon } from "./../../components/Icon.js";
import { Badge, Banner, Button, Card, CardHeader, Field, Input, KeyValue, PageHeader, Progress, Row, Select, Stat, StatusBadge, Tabs, TableWrap, Td, Th, } from "./../../components/ui.js";
import { downloadCSV, num, pct, zar, zarCompact } from "./../../lib/format.js";
import { useRouter } from "./../../router.js";
import { calcBreakEven, customerStats, financeSummary, fleetSummary, kpiRows, todayStats } from "./../../state/selectors.js";
import { useStore } from "./../../state/store.js";
import { cn } from "./../../utils/cn.js";
/* ====================== KPI CENTRE ====================== */
export function KpiPage() {
    const { state } = useStore();
    const rows = kpiRows(state);
    const meets = (r) => r.direction === "up" ? r.current >= r.target : r.direction === "down" ? r.current <= r.target : r.current === r.target;
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "KPI Centre", description: "How the operation is performing against the targets in the business plan. Green means the target is being met.", actions: _jsx(Button, { variant: "secondary", icon: "download", onClick: () => downloadCSV("easydrop-kpis.csv", rows.map((r) => ({ kpi: r.name, current: r.current.toFixed(1), target: r.target, unit: r.unit, meeting: meets(r) ? "Yes" : "No" }))), children: "Export" }) }), _jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-4", children: rows.map((r) => (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("p", { className: "text-[12.5px] font-semibold text-charcoal-500", children: r.name }), _jsx(Badge, { tone: meets(r) ? "success" : "warning", children: meets(r) ? "On target" : "Below target" })] }), _jsx("p", { className: cn("num mt-2 text-[28px] font-bold leading-none", meets(r) ? "text-brand-600" : "text-amber-600"), children: r.unit === "%" ? pct(r.current, 1) : num(r.current, r.current % 1 ? 1 : 0) }), _jsxs("p", { className: "mt-1 text-[12px] text-charcoal-400", children: ["Target ", r.direction === "up" ? "≥" : r.direction === "down" ? "≤" : "=", " ", r.unit === "%" ? pct(r.target) : num(r.target)] }), _jsx("div", { className: "mt-2", children: _jsx(Progress, { value: r.direction === "zero" ? (r.current === 0 ? 100 : 0) : Math.min(100, (r.current / Math.max(0.01, r.target)) * 100), tone: meets(r) ? "success" : "warning" }) }), _jsx("p", { className: "mt-2 text-[11.5px] text-charcoal-400", children: r.note })] }, r.name))) }), _jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { title: "On-time delivery trend", subtitle: "30 days against the 95% target", icon: "clock" }), _jsx("div", { className: "p-4", children: _jsx(LineChart, { data: state.history.map((h) => ({ label: h.date.slice(8), value: h.onTimePct })), height: 200, target: 95, targetLabel: "Target 95%", valueFormat: (v) => `${v.toFixed(1)}%` }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "First-attempt success trend", subtitle: "30 days against the 90% target", icon: "target" }), _jsx("div", { className: "p-4", children: _jsx(LineChart, { data: state.history.map((h) => ({ label: h.date.slice(8), value: h.firstAttemptPct })), height: 200, target: 90, targetLabel: "Target 90%", colour: "#2b5480", valueFormat: (v) => `${v.toFixed(1)}%` }) })] })] })] }));
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
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Financials", description: "Revenue, costs, vehicle profitability and customer billing for the operation.", actions: _jsx(Button, { variant: "secondary", icon: "printer", onClick: () => window.print(), children: "Print" }) }), _jsx("div", { className: "mb-4", children: _jsx(Banner, { tone: "warning", icon: "info", title: "ILLUSTRATIVE DEMO DATA", children: "The figures on this page are illustrative for the purposes of this demonstration. They are NOT actual company financial results." }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-5", children: [_jsx(Stat, { label: "Monthly revenue", value: zarCompact(fin.revenue), tone: "success", icon: "money" }), _jsx(Stat, { label: "Operating costs", value: zarCompact(fin.costs), tone: "warning", icon: "calculator" }), _jsx(Stat, { label: "Contribution", value: zarCompact(fin.contribution), tone: "success", sub: pct(fin.marginPct) + " margin", icon: "activity" }), _jsx(Stat, { label: "Avg revenue / delivery", value: zar(fin.avgRevenuePerDelivery), icon: "package" }), _jsx(Stat, { label: "Est. cost / delivery", value: zar(fin.avgCostPerDelivery), icon: "truck" })] }), _jsxs(Card, { className: "mt-4", children: [_jsx(Tabs, { className: "px-3", active: tab, onChange: setTab, tabs: [
                            { key: "dashboard", label: "Financial dashboard" },
                            { key: "revenue", label: "Revenue" },
                            { key: "costs", label: "Costs" },
                            { key: "vehicles", label: "Vehicle profitability" },
                            { key: "billing", label: "Customer billing" },
                        ] }), _jsxs("div", { className: "p-4", children: [tab === "dashboard" && (_jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400", children: "Revenue vs costs (30 days)" }), _jsx(BarChart, { data: revenueSeries, compare: costSeries, height: 210, valueFormat: (v) => zarCompact(v), compareColour: "#d97706" }), _jsx("p", { className: "mt-2 text-[11.5px] text-charcoal-400", children: "Green = revenue \u00B7 Amber = costs" })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400", children: "Cost structure (monthly)" }), _jsx(Donut, { segments: fin.costLines.slice(0, 6).map((c) => ({ label: c.name, value: c.value })), centreValue: zarCompact(fin.costs), centreLabel: "monthly costs" })] }), _jsx("div", { className: "lg:col-span-2", children: _jsx(KeyValue, { cols: 3, items: [
                                                ["Deliveries today", num(t.total)],
                                                ["Revenue today", zar(t.revenue)],
                                                ["Estimated cost today", zar(t.completed * fin.avgCostPerDelivery)],
                                                ["Contribution today", zar(t.revenue - t.completed * fin.avgCostPerDelivery)],
                                                ["Active vehicles", `${fleet.active} / ${fleet.total}`],
                                                ["Revenue per active vehicle (month)", zar(fin.revenue / Math.max(1, fleet.total))],
                                            ] }) })] })), tab === "revenue" && (_jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400", children: "Revenue by customer (month to date)" }), _jsx(HBars, { data: state.customers.map((c) => ({ label: c.business, value: c.revenueMtd, colour: c.logoTone })), valueFormat: (v) => zar(v) })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400", children: "Revenue by service (today)" }), _jsx(HBars, { data: ["Standard Local", "Extended Urban", "Same-Day Priority", "Scheduled Route", "Reverse Logistics"].map((s) => ({
                                                    label: s,
                                                    value: state.deliveries.filter((d) => d.service === s).reduce((sum, d) => sum + d.price, 0),
                                                })), valueFormat: (v) => zar(v), colour: "#12a05c" })] })] })), tab === "costs" && (_jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs(TableWrap, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx(Th, { children: "Cost line" }), _jsx(Th, { children: "Monthly" }), _jsx(Th, { children: "% of costs" }), _jsx(Th, { children: "Per delivery" })] }) }), _jsxs("tbody", { children: [fin.costLines.map((c) => (_jsxs(Row, { children: [_jsx(Td, { className: "font-semibold text-navy-950", children: c.name }), _jsx(Td, { className: "num", children: zar(c.value) }), _jsx(Td, { className: "num", children: pct((c.value / fin.costs) * 100, 1) }), _jsx(Td, { className: "num", children: zar(c.value / 13500, 2) })] }, c.name))), _jsxs(Row, { className: "bg-mist-50", children: [_jsx(Td, { className: "font-bold text-navy-950", children: "Total operating costs" }), _jsx(Td, { className: "num font-bold", children: zar(fin.costs) }), _jsx(Td, { className: "num font-bold", children: "100%" }), _jsx(Td, { className: "num font-bold", children: zar(fin.avgCostPerDelivery) })] })] })] }), _jsx(HBars, { data: fin.costLines.map((c) => ({ label: c.name, value: c.value })), valueFormat: (v) => zar(v), colour: "#d97706" })] })), tab === "vehicles" && (_jsxs(TableWrap, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx(Th, { children: "Vehicle" }), _jsx(Th, { children: "Deliveries (month)" }), _jsx(Th, { children: "Revenue" }), _jsx(Th, { children: "Costs" }), _jsx(Th, { children: "Contribution" }), _jsx(Th, { children: "Margin" }), _jsx(Th, { children: "Utilisation" })] }) }), _jsx("tbody", { children: state.vehicles.map((v) => {
                                            const profit = v.revenueMtd - v.costsMtd;
                                            return (_jsxs(Row, { children: [_jsx(Td, { className: "font-semibold text-navy-950", children: v.id }), _jsx(Td, { className: "num", children: num(v.deliveriesMtd) }), _jsx(Td, { className: "num", children: zar(v.revenueMtd) }), _jsx(Td, { className: "num", children: zar(v.costsMtd) }), _jsx(Td, { className: cn("num font-semibold", profit > 0 ? "text-brand-700" : "text-red-700"), children: zar(profit) }), _jsx(Td, { className: "num", children: pct((profit / Math.max(1, v.revenueMtd)) * 100) }), _jsx(Td, { children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Progress, { value: v.utilisationPct, className: "w-14" }), _jsxs("span", { className: "num text-[12px]", children: [v.utilisationPct, "%"] })] }) })] }, v.id));
                                        }) })] })), tab === "billing" && (_jsxs(TableWrap, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx(Th, { children: "Customer" }), _jsx(Th, { children: "Account" }), _jsx(Th, { children: "Contract" }), _jsx(Th, { children: "Deliveries (month)" }), _jsx(Th, { children: "Invoice value" }), _jsx(Th, { children: "Terms" }), _jsx(Th, { children: "Status" })] }) }), _jsx("tbody", { children: state.customers.map((c) => (_jsxs(Row, { children: [_jsx(Td, { className: "font-semibold text-navy-950", children: c.business }), _jsx(Td, { className: "num", children: c.accountNumber }), _jsx(Td, { children: c.contract }), _jsx(Td, { className: "num", children: num(c.deliveriesMtd) }), _jsx(Td, { className: "num", children: zar(c.revenueMtd) }), _jsx(Td, { children: c.billingTerms }), _jsx(Td, { children: _jsx(StatusBadge, { status: c.complaints > 5 ? "Under Review" : "Active" }) })] }, c.id))) })] }))] })] })] }));
}
/* ====================== BREAK-EVEN ====================== */
const FIELDS = [
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
        const out = [];
        for (let d = 20; d <= 60; d += 5) {
            const r = calcBreakEven({ ...inputs, deliveriesPerVehicleDay: d });
            out.push({ label: `${d}`, value: Math.round(r.contribution) });
        }
        return out;
    }, [inputs]);
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Break-even Calculator", description: "Change any input to see how many deliveries the operation needs to cover its costs. Everything recalculates immediately.", actions: _jsx(Button, { variant: "secondary", icon: "refresh", onClick: () => dispatch({ type: "SET_BREAKEVEN", patch: defaultInputs() }), children: "Reset to plan" }) }), _jsx("div", { className: "mb-4", children: _jsx(Banner, { tone: "warning", icon: "info", title: "ILLUSTRATIVE DEMO DATA", children: "These inputs are modelling assumptions for demonstration purposes only \u2014 not actual company financial results." }) }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-[380px_1fr]", children: [_jsxs(Card, { children: [_jsx(CardHeader, { title: "Inputs", subtitle: "Adjust the operating assumptions", icon: "calculator" }), _jsx("div", { className: "grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1", children: FIELDS.map((f) => (_jsx(Field, { label: f.label, hint: f.hint, children: _jsx(Input, { type: "number", min: 0, value: inputs[f.key], onChange: (e) => dispatch({ type: "SET_BREAKEVEN", patch: { [f.key]: Number(e.target.value) } }) }) }, String(f.key)))) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4", children: [_jsx(Stat, { label: "Monthly deliveries", value: num(result.monthlyDeliveries), icon: "package" }), _jsx(Stat, { label: "Monthly revenue", value: zarCompact(result.revenue), tone: "success", icon: "money" }), _jsx(Stat, { label: "Monthly costs", value: zarCompact(result.totalCosts), tone: "warning", icon: "calculator" }), _jsx(Stat, { label: "Contribution", value: zarCompact(result.contribution), tone: result.contribution >= 0 ? "success" : "critical", sub: pct(result.marginPct) + " margin", icon: "activity" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { title: "Results", subtitle: "What these assumptions produce", icon: "target" }), _jsxs("div", { className: "grid gap-4 p-4 lg:grid-cols-2", children: [_jsx(KeyValue, { cols: 1, items: [
                                                    ["Monthly deliveries", num(result.monthlyDeliveries)],
                                                    ["Revenue", zar(result.revenue)],
                                                    ["Variable (per-vehicle) costs", zar(result.variableCosts)],
                                                    ["Fixed costs", zar(result.fixedCosts)],
                                                    ["Total costs", zar(result.totalCosts)],
                                                    ["Contribution", _jsx("span", { className: result.contribution >= 0 ? "text-brand-700" : "text-red-700", children: zar(result.contribution) })],
                                                    ["Contribution per vehicle", zar(result.contributionPerVehicle)],
                                                    ["Cost per delivery", zar(result.costPerDelivery, 2)],
                                                    ["Break-even deliveries per month", num(Math.ceil(result.breakEvenDeliveries))],
                                                    ["Break-even per vehicle per day", num(result.breakEvenPerVehicleDay, 1)],
                                                ] }), _jsxs("div", { children: [_jsx("p", { className: "mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400", children: "Contribution at different delivery volumes" }), _jsx(BarChart, { data: scenario, height: 200, valueFormat: (v) => zarCompact(v), colour: "#2b5480" }), _jsx("p", { className: "mt-2 text-[11.5px] text-charcoal-400", children: "Deliveries per vehicle per day \u2192" }), _jsxs("div", { className: "mt-3 rounded-md border border-mist-200 bg-mist-50 p-3 text-[13px] text-charcoal-700", children: ["At ", inputs.deliveriesPerVehicleDay, " deliveries per vehicle per day across ", inputs.vehicles, " vehicles, the operation ", result.contribution >= 0 ? "covers its costs and contributes" : "does not yet cover its costs — it is short by", " ", _jsx("span", { className: "font-bold", children: zar(Math.abs(result.contribution)) }), " per month. Break-even needs about", " ", _jsx("span", { className: "font-bold", children: num(result.breakEvenPerVehicleDay, 1) }), " deliveries per vehicle per day."] })] })] })] })] })] })] }));
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
    const rows = {
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
        return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: report.name, description: report.desc, actions: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "secondary", icon: "chevronLeft", onClick: () => setParam("r", null), children: "Reports centre" }), report.key === "daily" && (_jsx(Select, { value: range, onChange: (e) => setRange(e.target.value), options: [{ value: "7", label: "Last 7 days" }, { value: "14", label: "Last 14 days" }, { value: "30", label: "Last 30 days" }], className: "h-10 w-40" })), _jsx(Button, { variant: "secondary", icon: "printer", onClick: () => window.print(), children: "Print" }), _jsx(Button, { variant: "primary", icon: "download", onClick: () => downloadCSV(`easydrop-${report.key}-report.csv`, data), children: "Export CSV" })] }) }), _jsxs(Card, { children: [_jsx(CardHeader, { title: `${report.name} — generated ${new Date().toLocaleString("en-ZA")}`, subtitle: `${data.length} rows · demo environment, simulated data`, icon: report.icon }), _jsxs(TableWrap, { children: [_jsx("thead", { children: _jsx("tr", { children: headers.map((h) => _jsx(Th, { children: h }, h)) }) }), _jsx("tbody", { children: data.map((r, i) => (_jsx(Row, { children: headers.map((h) => (_jsx(Td, { className: typeof r[h] === "number" ? "num" : "", children: typeof r[h] === "number" && /revenue|cost|value|price/i.test(h) ? zar(r[h]) : String(r[h] ?? "") }, h))) }, i))) })] })] })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Reports Centre", description: "Generate, filter, print or export any operational report. All reports read from the same live demo data." }), _jsxs("div", { className: "grid grid-cols-2 gap-3 lg:grid-cols-4", children: [_jsx(Stat, { label: "Deliveries today", value: num(t.total), icon: "package" }), _jsx(Stat, { label: "Completed", value: num(t.completed), tone: "success", icon: "check" }), _jsx(Stat, { label: "On-time", value: pct(t.onTimePct), icon: "clock" }), _jsx(Stat, { label: "Revenue today", value: zar(t.revenue), tone: "success", icon: "money" })] }), _jsx("div", { className: "mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: REPORTS.map((r) => (_jsxs(Card, { className: "flex flex-col p-5", children: [_jsx("span", { className: "grid h-10 w-10 place-items-center rounded-md bg-navy-950 text-brand-400", children: _jsx(Icon, { name: r.icon, className: "h-5 w-5" }) }), _jsx("h3", { className: "mt-3 text-[15px] font-bold text-navy-950", children: r.name }), _jsx("p", { className: "mt-1 flex-1 text-[13px] text-charcoal-500", children: r.desc }), _jsx(Button, { variant: "secondary", className: "mt-3 w-full", icon: "arrowRight", onClick: () => setParam("r", r.key), children: "Open report" })] }, r.key))) })] }));
}
