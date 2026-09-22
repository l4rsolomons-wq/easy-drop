import { jsx as _jsx, jsxs as _jsxs } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { Icon } from "./components/Icon.js";
import { Button } from "./components/ui.js";
import { AppShell } from "./layouts/AppShell.js";
import Dashboard from "./pages/ops/Dashboard.js";
import { BreakEvenPage, FinancialsPage, KpiPage, ReportsPage } from "./pages/ops/Business.js";
import { FuelPage, MaintenancePage, PartsPage, VehiclesPage } from "./pages/ops/Fleet.js";
import { DeliveriesPage, DispatchPage, HubPage, RoutesPage, TrackingPage } from "./pages/ops/Operations.js";
import { CustomersPage, DriversPage, TrainingPage } from "./pages/ops/People.js";
import { IncidentsPage, InspectionsPage, NearMissesPage, SafetyPage } from "./pages/ops/Safety.js";
import { CompliancePage, DocumentsPage, NotificationsPage, SearchPage, SettingsPage, UsersPage, } from "./pages/ops/System.js";
import DriverApp from "./pages/driver/DriverApp.js";
import CustomerPortal from "./pages/portal/CustomerPortal.js";
import PublicSite from "./pages/site/PublicSite.js";
import { Link, RouterProvider, useRouter } from "./router.js";
import { StoreProvider, useStore } from "./state/store.js";
import { cn } from "./utils/cn.js";
const SITE_PAGES = ["/", "/about", "/services", "/business-solutions", "/how-it-works", "/contact", "/login"];
const OPS_ROUTES = {
    "/ops": () => _jsx(Dashboard, {}),
    "/ops/deliveries": () => _jsx(DeliveriesPage, {}),
    "/ops/dispatch": () => _jsx(DispatchPage, {}),
    "/ops/routes": () => _jsx(RoutesPage, {}),
    "/ops/tracking": () => _jsx(TrackingPage, {}),
    "/ops/hub": () => _jsx(HubPage, {}),
    "/ops/vehicles": () => _jsx(VehiclesPage, {}),
    "/ops/maintenance": () => _jsx(MaintenancePage, {}),
    "/ops/fuel": () => _jsx(FuelPage, {}),
    "/ops/parts": () => _jsx(PartsPage, {}),
    "/ops/drivers": () => _jsx(DriversPage, {}),
    "/ops/customers": () => _jsx(CustomersPage, {}),
    "/ops/business-profiles": () => _jsx(CustomersPage, { businessView: true }),
    "/ops/safety": () => _jsx(SafetyPage, {}),
    "/ops/incidents": () => _jsx(IncidentsPage, {}),
    "/ops/near-misses": () => _jsx(NearMissesPage, {}),
    "/ops/inspections": () => _jsx(InspectionsPage, {}),
    "/ops/training": () => _jsx(TrainingPage, {}),
    "/ops/kpi": () => _jsx(KpiPage, {}),
    "/ops/financials": () => _jsx(FinancialsPage, {}),
    "/ops/break-even": () => _jsx(BreakEvenPage, {}),
    "/ops/reports": () => _jsx(ReportsPage, {}),
    "/ops/compliance": () => _jsx(CompliancePage, {}),
    "/ops/documents": () => _jsx(DocumentsPage, {}),
    "/ops/notifications": () => _jsx(NotificationsPage, {}),
    "/ops/search": () => _jsx(SearchPage, {}),
    "/ops/users": () => _jsx(UsersPage, {}),
    "/ops/settings": () => _jsx(SettingsPage, {}),
};
function NotFound({ path }) {
    return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-mist-100 p-6 text-center", children: [_jsx("span", { className: "grid h-14 w-14 place-items-center rounded-full bg-navy-950 text-white", children: _jsx(Icon, { name: "search", className: "h-6 w-6" }) }), _jsx("h1", { className: "text-[22px] font-bold text-navy-950", children: "Page not found" }), _jsxs("p", { className: "max-w-md text-[14px] text-charcoal-500", children: ["There is nothing at ", _jsx("code", { className: "rounded bg-white px-1.5 py-0.5", children: path }), ". Use one of the links below to get back into the platform."] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-2", children: [_jsx(Link, { to: "/", children: _jsx(Button, { variant: "secondary", icon: "home", children: "Website" }) }), _jsx(Link, { to: "/ops", children: _jsx(Button, { variant: "primary", icon: "dashboard", children: "Operations" }) }), _jsx(Link, { to: "/driver", children: _jsx(Button, { variant: "secondary", icon: "truck", children: "Driver app" }) }), _jsx(Link, { to: "/portal", children: _jsx(Button, { variant: "secondary", icon: "briefcase", children: "Customer portal" }) })] })] }));
}
function Toasts() {
    const { toasts, dismissToast } = useStore();
    if (!toasts.length)
        return null;
    return (_jsx("div", { className: "no-print pointer-events-none fixed bottom-3 left-1/2 z-[60] flex w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0", role: "status", "aria-live": "polite", children: toasts.map((t) => (_jsxs("div", { className: cn("anim-in pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-white p-3 shadow-xl", t.tone === "success" ? "border-brand-300" : t.tone === "warning" ? "border-amber-300" : t.tone === "critical" ? "border-red-300" : "border-mist-300"), children: [_jsx("span", { className: cn("grid h-7 w-7 shrink-0 place-items-center rounded-full", t.tone === "success" ? "bg-brand-100 text-brand-700" : t.tone === "warning" ? "bg-amber-100 text-amber-700" : t.tone === "critical" ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700"), children: _jsx(Icon, { name: t.tone === "success" ? "check" : t.tone === "critical" ? "warning" : "info", className: "h-4 w-4" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-[13.5px] font-semibold text-navy-950", children: t.title }), t.message && _jsx("p", { className: "mt-0.5 text-[12.5px] leading-snug text-charcoal-500", children: t.message })] }), _jsx("button", { onClick: () => dismissToast(t.id), "aria-label": "Dismiss notification", className: "rounded p-0.5 text-charcoal-400 hover:bg-mist-100", children: _jsx(Icon, { name: "x", className: "h-4 w-4" }) })] }, t.id))) }));
}
function Routes() {
    const { path } = useRouter();
    if (SITE_PAGES.includes(path))
        return _jsx(PublicSite, { page: path });
    if (path.startsWith("/driver"))
        return _jsx(DriverApp, { page: path });
    if (path.startsWith("/portal"))
        return _jsx(CustomerPortal, { page: path });
    if (path.startsWith("/ops")) {
        const render = OPS_ROUTES[path];
        return _jsx(AppShell, { children: render ? render() : _jsx(NotFound, { path: path }) });
    }
    return _jsx(NotFound, { path: path });
}
export default function App() {
    return (_jsx(StoreProvider, { children: _jsxs(RouterProvider, { children: [_jsx(Routes, {}), _jsx(Toasts, {})] }) }));
}
