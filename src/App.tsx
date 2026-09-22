import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { AppShell } from "@/layouts/AppShell";
import Dashboard from "@/pages/ops/Dashboard";
import { BreakEvenPage, FinancialsPage, KpiPage, ReportsPage } from "@/pages/ops/Business";
import { FuelPage, MaintenancePage, PartsPage, VehiclesPage } from "@/pages/ops/Fleet";
import { DeliveriesPage, DispatchPage, HubPage, RoutesPage, TrackingPage } from "@/pages/ops/Operations";
import { CustomersPage, DriversPage, TrainingPage } from "@/pages/ops/People";
import { IncidentsPage, InspectionsPage, NearMissesPage, SafetyPage } from "@/pages/ops/Safety";
import {
  CompliancePage, DocumentsPage, NotificationsPage, SearchPage, SettingsPage, UsersPage,
} from "@/pages/ops/System";
import DriverApp from "@/pages/driver/DriverApp";
import CustomerPortal from "@/pages/portal/CustomerPortal";
import PublicSite from "@/pages/site/PublicSite";
import { Link, RouterProvider, useRouter } from "@/router";
import { StoreProvider, useStore } from "@/state/store";
import { cn } from "@/utils/cn";

const SITE_PAGES = ["/", "/about", "/services", "/business-solutions", "/how-it-works", "/contact", "/login"];

const OPS_ROUTES: Record<string, () => React.ReactElement> = {
  "/ops": () => <Dashboard />,
  "/ops/deliveries": () => <DeliveriesPage />,
  "/ops/dispatch": () => <DispatchPage />,
  "/ops/routes": () => <RoutesPage />,
  "/ops/tracking": () => <TrackingPage />,
  "/ops/hub": () => <HubPage />,
  "/ops/vehicles": () => <VehiclesPage />,
  "/ops/maintenance": () => <MaintenancePage />,
  "/ops/fuel": () => <FuelPage />,
  "/ops/parts": () => <PartsPage />,
  "/ops/drivers": () => <DriversPage />,
  "/ops/customers": () => <CustomersPage />,
  "/ops/business-profiles": () => <CustomersPage businessView />,
  "/ops/safety": () => <SafetyPage />,
  "/ops/incidents": () => <IncidentsPage />,
  "/ops/near-misses": () => <NearMissesPage />,
  "/ops/inspections": () => <InspectionsPage />,
  "/ops/training": () => <TrainingPage />,
  "/ops/kpi": () => <KpiPage />,
  "/ops/financials": () => <FinancialsPage />,
  "/ops/break-even": () => <BreakEvenPage />,
  "/ops/reports": () => <ReportsPage />,
  "/ops/compliance": () => <CompliancePage />,
  "/ops/documents": () => <DocumentsPage />,
  "/ops/notifications": () => <NotificationsPage />,
  "/ops/search": () => <SearchPage />,
  "/ops/users": () => <UsersPage />,
  "/ops/settings": () => <SettingsPage />,
};

function NotFound({ path }: { path: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mist-100 p-6 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-navy-950 text-white">
        <Icon name="search" className="h-6 w-6" />
      </span>
      <h1 className="text-[22px] font-bold text-navy-950">Page not found</h1>
      <p className="max-w-md text-[14px] text-charcoal-500">
        There is nothing at <code className="rounded bg-white px-1.5 py-0.5">{path}</code>. Use one of the links below to
        get back into the platform.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/"><Button variant="secondary" icon="home">Website</Button></Link>
        <Link to="/ops"><Button variant="primary" icon="dashboard">Operations</Button></Link>
        <Link to="/driver"><Button variant="secondary" icon="truck">Driver app</Button></Link>
        <Link to="/portal"><Button variant="secondary" icon="briefcase">Customer portal</Button></Link>
      </div>
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useStore();
  if (!toasts.length) return null;
  return (
    <div className="no-print pointer-events-none fixed bottom-3 left-1/2 z-[60] flex w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "anim-in pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-white p-3 shadow-xl",
            t.tone === "success" ? "border-brand-300" : t.tone === "warning" ? "border-amber-300" : t.tone === "critical" ? "border-red-300" : "border-mist-300",
          )}
        >
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full",
              t.tone === "success" ? "bg-brand-100 text-brand-700" : t.tone === "warning" ? "bg-amber-100 text-amber-700" : t.tone === "critical" ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700",
            )}
          >
            <Icon name={t.tone === "success" ? "check" : t.tone === "critical" ? "warning" : "info"} className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-navy-950">{t.title}</p>
            {t.message && <p className="mt-0.5 text-[12.5px] leading-snug text-charcoal-500">{t.message}</p>}
          </div>
          <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="rounded p-0.5 text-charcoal-400 hover:bg-mist-100">
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function Routes() {
  const { path } = useRouter();

  if (SITE_PAGES.includes(path)) return <PublicSite page={path} />;
  if (path.startsWith("/driver")) return <DriverApp page={path} />;
  if (path.startsWith("/portal")) return <CustomerPortal page={path} />;
  if (path.startsWith("/ops")) {
    const render = OPS_ROUTES[path];
    return <AppShell>{render ? render() : <NotFound path={path} />}</AppShell>;
  }
  return <NotFound path={path} />;
}

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider>
        <Routes />
        <Toasts />
      </RouterProvider>
    </StoreProvider>
  );
}
