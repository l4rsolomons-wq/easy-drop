import { jsx as _jsx, jsxs as _jsxs } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@19.2.6";
import { Icon, Logo } from "./../components/Icon.js";
import { Badge, Button } from "./../components/ui.js";
import { Link, useRouter } from "./../router.js";
import { useStore } from "./../state/store.js";
import { globalSearch } from "./../state/selectors.js";
import { relTime } from "./../lib/format.js";
import { cn } from "./../utils/cn.js";
export const useNav = () => {
    const { state } = useStore();
    const unassigned = state.deliveries.filter((d) => d.status === "Pending").length;
    const openIncidents = state.incidents.filter((i) => i.status !== "Closed").length;
    const dueMaint = state.maintenance.filter((m) => m.status === "Due" || m.status === "Overdue").length;
    return [
        { group: "Overview", items: [{ label: "Dashboard", to: "/ops", icon: "dashboard" }] },
        {
            group: "Operations",
            items: [
                { label: "Deliveries", to: "/ops/deliveries", icon: "package" },
                { label: "Dispatch", to: "/ops/dispatch", icon: "send", badge: unassigned },
                { label: "Routes", to: "/ops/routes", icon: "route" },
                { label: "Tracking", to: "/ops/tracking", icon: "pin" },
                { label: "Hub / Depot", to: "/ops/hub", icon: "hub" },
            ],
        },
        {
            group: "Fleet",
            items: [
                { label: "Vehicles", to: "/ops/vehicles", icon: "truck" },
                { label: "Maintenance", to: "/ops/maintenance", icon: "wrench", badge: dueMaint },
                { label: "Fuel & Energy", to: "/ops/fuel", icon: "fuel" },
                { label: "Parts & Inventory", to: "/ops/parts", icon: "box" },
            ],
        },
        {
            group: "People",
            items: [
                { label: "Drivers", to: "/ops/drivers", icon: "users" },
                { label: "Customers", to: "/ops/customers", icon: "briefcase" },
                { label: "Business Profiles", to: "/ops/business-profiles", icon: "building" },
            ],
        },
        {
            group: "Safety",
            items: [
                { label: "Safety Dashboard", to: "/ops/safety", icon: "shield" },
                { label: "Incidents", to: "/ops/incidents", icon: "alert", badge: openIncidents },
                { label: "Near Misses", to: "/ops/near-misses", icon: "eye" },
                { label: "Inspections", to: "/ops/inspections", icon: "clipboard" },
                { label: "Training", to: "/ops/training", icon: "graduation" },
            ],
        },
        {
            group: "Business",
            items: [
                { label: "KPI Centre", to: "/ops/kpi", icon: "target" },
                { label: "Financials", to: "/ops/financials", icon: "money" },
                { label: "Break-even", to: "/ops/break-even", icon: "calculator" },
                { label: "Reports", to: "/ops/reports", icon: "file" },
            ],
        },
        {
            group: "Compliance",
            items: [
                { label: "Compliance", to: "/ops/compliance", icon: "badge" },
                { label: "Documents", to: "/ops/documents", icon: "folder" },
            ],
        },
        {
            group: "System",
            items: [
                { label: "Notifications", to: "/ops/notifications", icon: "bell" },
                { label: "Search", to: "/ops/search", icon: "search" },
                { label: "Users", to: "/ops/users", icon: "user" },
                { label: "Settings", to: "/ops/settings", icon: "settings" },
            ],
        },
    ];
};
/* ------------------------- Experience switcher ------------------------ */
export function ExperienceSwitcher({ compact }) {
    const { navigate, path } = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutside(ref, () => setOpen(false));
    const current = path.startsWith("/ops") ? "Operations" : path.startsWith("/driver") ? "Driver App" : path.startsWith("/portal") ? "Customer Portal" : "Website";
    const options = [
        { label: "Public Website", to: "/", icon: "home", desc: "Marketing site" },
        { label: "Operations Platform", to: "/ops", icon: "dashboard", desc: "Control centre" },
        { label: "Driver App", to: "/driver", icon: "truck", desc: "Mobile-first" },
        { label: "Customer Portal", to: "/portal", icon: "briefcase", desc: "Business customer" },
    ];
    return (_jsxs("div", { className: "relative", ref: ref, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), className: cn("flex items-center gap-2 rounded-md border border-mist-300 bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-charcoal-700 hover:bg-mist-50", compact && "px-2"), "aria-haspopup": "menu", "aria-expanded": open, children: [_jsx(Icon, { name: "layers", className: "h-4 w-4 text-brand-600" }), !compact && _jsx("span", { className: "hidden sm:inline", children: current }), _jsx(Icon, { name: "chevronDown", className: "h-3.5 w-3.5 text-charcoal-400" })] }), open && (_jsxs("div", { className: "anim-in absolute right-0 z-40 mt-1.5 w-64 overflow-hidden rounded-lg border border-mist-200 bg-white shadow-xl", role: "menu", children: [_jsx("p", { className: "border-b border-mist-200 bg-mist-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-charcoal-400", children: "Switch experience" }), options.map((o) => (_jsxs("button", { role: "menuitem", onClick: () => {
                            setOpen(false);
                            navigate(o.to);
                        }, className: "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-mist-50", children: [_jsx(Icon, { name: o.icon, className: "h-4 w-4 text-navy-700" }), _jsxs("span", { className: "flex-1", children: [_jsx("span", { className: "block text-[13px] font-semibold text-navy-950", children: o.label }), _jsx("span", { className: "block text-[11.5px] text-charcoal-400", children: o.desc })] }), current.startsWith(o.label.split(" ")[0]) && _jsx(Icon, { name: "check", className: "h-4 w-4 text-brand-600" })] }, o.to)))] }))] }));
}
function useOutside(ref, cb) {
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                cb();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [ref, cb]);
}
/* ----------------------------- Global search -------------------------- */
function GlobalSearchBox() {
    const { state } = useStore();
    const { navigate } = useRouter();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutside(ref, () => setOpen(false));
    const hits = useMemo(() => globalSearch(state, q).slice(0, 8), [state, q]);
    return (_jsxs("div", { className: "relative min-w-0 flex-1 md:max-w-md", ref: ref, children: [_jsx("label", { className: "sr-only", htmlFor: "global-search", children: "Search deliveries, vehicles, drivers, customers" }), _jsxs("div", { className: "relative", children: [_jsx(Icon, { name: "search", className: "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" }), _jsx("input", { id: "global-search", value: q, onChange: (e) => {
                            setQ(e.target.value);
                            setOpen(true);
                        }, onFocus: () => setOpen(true), onKeyDown: (e) => {
                            if (e.key === "Enter" && q.trim().length > 1) {
                                setOpen(false);
                                navigate(`/ops/search?q=${encodeURIComponent(q)}`);
                            }
                        }, placeholder: "Search deliveries, vehicles, drivers, customers\u2026", className: "h-9 w-full rounded-md border border-mist-300 bg-mist-50 pl-8 pr-3 text-[13px] placeholder:text-charcoal-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20" })] }), open && q.trim().length > 1 && (_jsxs("div", { className: "anim-in absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-lg border border-mist-200 bg-white shadow-xl", children: [hits.length === 0 ? (_jsxs("p", { className: "px-3 py-4 text-[13px] text-charcoal-400", children: ["No matches for \u201C", q, "\u201D."] })) : (_jsx("ul", { children: hits.map((h) => (_jsx("li", { children: _jsxs("button", { onClick: () => {
                                    setOpen(false);
                                    setQ("");
                                    navigate(h.link);
                                }, className: "flex w-full items-center gap-3 border-b border-mist-100 px-3 py-2 text-left last:border-0 hover:bg-mist-50", children: [_jsx(Badge, { tone: "navy", children: h.type }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "block truncate text-[13px] font-semibold text-navy-950", children: h.title }), _jsx("span", { className: "block truncate text-[11.5px] text-charcoal-400", children: h.subtitle })] }), _jsx(Icon, { name: "chevronRight", className: "h-4 w-4 text-charcoal-400" })] }) }, h.type + h.id))) })), _jsxs("button", { onClick: () => {
                            setOpen(false);
                            navigate(`/ops/search?q=${encodeURIComponent(q)}`);
                        }, className: "w-full bg-mist-50 px-3 py-2 text-left text-[12px] font-semibold text-brand-700 hover:bg-mist-100", children: ["View all results for \u201C", q, "\u201D"] })] }))] }));
}
/* ----------------------------- Notifications -------------------------- */
function NotificationBell() {
    const { state, dispatch } = useStore();
    const { navigate } = useRouter();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutside(ref, () => setOpen(false));
    const unread = state.notifications.filter((n) => !n.read).length;
    return (_jsxs("div", { className: "relative", ref: ref, children: [_jsxs("button", { onClick: () => setOpen((o) => !o), className: "relative grid h-9 w-9 place-items-center rounded-md border border-mist-300 bg-white text-charcoal-700 hover:bg-mist-50", "aria-label": `Notifications (${unread} unread)`, children: [_jsx(Icon, { name: "bell", className: "h-4.5 w-4.5" }), unread > 0 && (_jsx("span", { className: "num absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white", style: { height: 18, minWidth: 18 }, children: unread }))] }), open && (_jsxs("div", { className: "anim-in absolute right-0 z-40 mt-1.5 w-[340px] max-w-[92vw] overflow-hidden rounded-lg border border-mist-200 bg-white shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-mist-200 bg-mist-50 px-3 py-2", children: [_jsx("p", { className: "text-[12px] font-bold uppercase tracking-wide text-charcoal-500", children: "Notifications" }), _jsx("button", { onClick: () => dispatch({ type: "MARK_ALL_READ" }), className: "text-[12px] font-semibold text-brand-700 hover:underline", children: "Mark all read" })] }), _jsx("ul", { className: "scroll-thin max-h-[380px] overflow-y-auto", children: state.notifications.slice(0, 12).map((n) => (_jsx("li", { children: _jsxs("button", { onClick: () => {
                                    dispatch({ type: "MARK_READ", id: n.id });
                                    setOpen(false);
                                    navigate(n.link);
                                }, className: cn("flex w-full gap-2.5 border-b border-mist-100 px-3 py-2.5 text-left hover:bg-mist-50", !n.read && "bg-brand-50/40"), children: [_jsx("span", { className: cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", n.tone === "critical" ? "bg-red-100 text-red-700" : n.tone === "warning" ? "bg-amber-100 text-amber-700" : n.tone === "success" ? "bg-brand-100 text-brand-700" : "bg-sky-100 text-sky-700"), children: _jsx(Icon, { name: n.kind === "safety" ? "shield" : n.kind === "maintenance" ? "wrench" : n.kind === "vehicle" ? "truck" : n.kind === "compliance" ? "badge" : "package", className: "h-3.5 w-3.5" }) }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsxs("span", { className: "flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "truncate text-[13px] font-semibold text-navy-950", children: n.title }), _jsx("span", { className: "shrink-0 text-[11px] text-charcoal-400", children: relTime(n.at) })] }), _jsx("span", { className: "mt-0.5 block text-[12px] leading-snug text-charcoal-500", children: n.message })] })] }) }, n.id))) }), _jsx("button", { onClick: () => { setOpen(false); navigate("/ops/notifications"); }, className: "w-full bg-mist-50 px-3 py-2 text-[12px] font-semibold text-brand-700 hover:bg-mist-100", children: "View all notifications" })] }))] }));
}
/* ------------------------------ Demo controls ------------------------- */
export function DemoControls({ compact }) {
    const { state, dispatch, toast } = useStore();
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx(Button, { size: "sm", variant: "secondary", icon: "plus", onClick: () => {
                    dispatch({ type: "GENERATE_ACTIVITY" });
                    toast({ tone: "success", title: "Demo activity generated", message: "A new booking was created and a delivery was completed." });
                }, children: compact ? "Generate" : "Generate" }), _jsxs(Button, { size: "sm", variant: state.simulating ? "warning" : "secondary", icon: state.simulating ? "pause" : "play", onClick: () => {
                    dispatch({ type: "SET_SIMULATING", on: !state.simulating });
                    toast({ tone: "info", title: state.simulating ? "Movement simulation paused" : "Movement simulation running", message: "Vehicle markers update every 1.2 seconds." });
                }, children: [state.simulating ? "Stop" : "Simulate", " Movement"] }), _jsx(Button, { size: "sm", variant: "ghost", icon: "refresh", onClick: () => {
                    if (confirm("Reset the demo? All simulated changes will be restored to the seed data.")) {
                        dispatch({ type: "RESET_DEMO" });
                        toast({ tone: "info", title: "Demo reset", message: "Seed data restored." });
                    }
                }, children: "Reset Demo" })] }));
}
/* --------------------------------- Shell ------------------------------ */
export function AppShell({ children }) {
    const { state, dispatch } = useStore();
    const { path, navigate } = useRouter();
    const nav = useNav();
    const [mobileNav, setMobileNav] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const userRef = useRef(null);
    useOutside(userRef, () => setUserMenu(false));
    useEffect(() => setMobileNav(false), [path]);
    const sidebar = (_jsxs("nav", { className: "scroll-thin flex h-full flex-col overflow-y-auto bg-navy-950 pb-6", "aria-label": "Main navigation", children: [_jsxs("div", { className: "sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-white/10 bg-navy-950 px-4 py-3.5", children: [_jsx(Link, { to: "/ops", className: "min-w-0", children: _jsx(Logo, {}) }), _jsx("button", { className: "rounded p-1 text-mist-300 hover:bg-white/10 lg:hidden", onClick: () => setMobileNav(false), "aria-label": "Close navigation", children: _jsx(Icon, { name: "x", className: "h-5 w-5" }) })] }), _jsx("p", { className: "px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-400", children: "Operations Platform" }), nav.map((g) => (_jsxs("div", { className: "mt-2 px-2", children: [_jsx("p", { className: "px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/35", children: g.group }), _jsx("ul", { className: "space-y-0.5", children: g.items.map((item) => {
                            const active = path === item.to || (item.to !== "/ops" && path.startsWith(item.to));
                            return (_jsx("li", { children: _jsxs(Link, { to: item.to, className: cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors", active ? "bg-brand-500/15 text-white ring-1 ring-inset ring-brand-500/40" : "text-mist-300 hover:bg-white/5 hover:text-white"), "aria-current": active ? "page" : undefined, children: [_jsx(Icon, { name: item.icon, className: cn("h-4 w-4 shrink-0", active ? "text-brand-400" : "text-white/45") }), _jsx("span", { className: "flex-1 truncate", children: item.label }), !!item.badge && (_jsx("span", { className: "num rounded bg-white/10 px-1.5 text-[10.5px] font-bold text-white", children: item.badge }))] }) }, item.to));
                        }) })] }, g.group))), _jsx("div", { className: "mt-4 px-4", children: _jsxs("div", { className: "rounded-md border border-white/10 bg-white/5 p-3", children: [_jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-brand-400", children: "Demo environment" }), _jsx("p", { className: "mt-1 text-[11.5px] leading-snug text-mist-300", children: "All data on this platform is simulated for demonstration purposes." })] }) })] }));
    return (_jsxs("div", { className: "flex min-h-screen bg-mist-100", children: [_jsx("aside", { className: "hidden w-60 shrink-0 lg:block", children: _jsx("div", { className: "fixed bottom-0 top-0 w-60", children: sidebar }) }), mobileNav && (_jsxs("div", { className: "fixed inset-0 z-50 lg:hidden", children: [_jsx("button", { className: "absolute inset-0 bg-navy-950/60", onClick: () => setMobileNav(false), "aria-label": "Close navigation overlay" }), _jsx("div", { className: "anim-in absolute inset-y-0 left-0 w-[268px]", children: sidebar })] })), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsxs("header", { className: "no-print sticky top-0 z-30 border-b border-mist-200 bg-white/95 backdrop-blur", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 md:px-5", children: [_jsx("button", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-mist-300 lg:hidden", onClick: () => setMobileNav(true), "aria-label": "Open navigation", children: _jsx(Icon, { name: "menu", className: "h-5 w-5" }) }), _jsx(GlobalSearchBox, {}), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsx("div", { className: "hidden xl:block", children: _jsx(DemoControls, { compact: true }) }), _jsx(NotificationBell, {}), _jsx(ExperienceSwitcher, {}), _jsxs("div", { className: "relative", ref: userRef, children: [_jsxs("button", { onClick: () => setUserMenu((o) => !o), className: "flex items-center gap-2 rounded-md border border-mist-300 bg-white py-1 pl-1 pr-2 hover:bg-mist-50", "aria-haspopup": "menu", "aria-expanded": userMenu, children: [_jsx("span", { className: "grid h-7 w-7 place-items-center rounded bg-navy-950 text-[11px] font-bold text-white", children: "JM" }), _jsxs("span", { className: "hidden text-left sm:block", children: [_jsx("span", { className: "block text-[12.5px] font-semibold leading-tight text-navy-950", children: "John Mahlangu" }), _jsx("span", { className: "block text-[10.5px] leading-tight text-charcoal-400", children: state.session.role })] }), _jsx(Icon, { name: "chevronDown", className: "h-3.5 w-3.5 text-charcoal-400" })] }), userMenu && (_jsxs("div", { className: "anim-in absolute right-0 z-40 mt-1.5 w-60 overflow-hidden rounded-lg border border-mist-200 bg-white shadow-xl", role: "menu", children: [_jsx("p", { className: "border-b border-mist-200 bg-mist-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-charcoal-400", children: "Demo role (simulated)" }), ["ADMIN", "OPERATIONS", "DISPATCHER", "DRIVER", "BUSINESS CUSTOMER"].map((r) => (_jsxs("button", { role: "menuitem", onClick: () => {
                                                                    dispatch({ type: "SET_SESSION", patch: { role: r } });
                                                                    setUserMenu(false);
                                                                    if (r === "DRIVER")
                                                                        navigate("/driver");
                                                                    if (r === "BUSINESS CUSTOMER")
                                                                        navigate("/portal");
                                                                }, className: "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] hover:bg-mist-50", children: [r, state.session.role === r && _jsx(Icon, { name: "check", className: "h-4 w-4 text-brand-600" })] }, r))), _jsxs(Link, { to: "/", className: "flex items-center gap-2 border-t border-mist-200 px-3 py-2.5 text-[13px] font-semibold text-charcoal-700 hover:bg-mist-50", children: [_jsx(Icon, { name: "logout", className: "h-4 w-4" }), " Exit to website"] })] }))] })] })] }), _jsxs("div", { className: "flex items-center justify-between gap-2 border-t border-mist-200 bg-navy-950 px-3 py-1.5 text-white md:px-5 xl:hidden", children: [_jsx("span", { className: "text-[10.5px] font-bold uppercase tracking-wider text-brand-400", children: "Demo environment \u2014 simulated data" }), _jsx(DemoControls, { compact: true })] })] }), _jsx("main", { className: "min-w-0 flex-1 px-3 py-4 md:px-5 md:py-6", children: children }), _jsx("footer", { className: "no-print border-t border-mist-200 bg-white px-5 py-3 text-[11.5px] text-charcoal-400", children: "Easy Drop Operations Platform \u00B7 Demo environment \u2014 simulated data \u00B7 Delivering a smarter tomorrow" })] })] }));
}
