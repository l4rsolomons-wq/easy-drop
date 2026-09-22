import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "https://esm.sh/react@19.2.6/jsx-runtime";
import { useState } from "https://esm.sh/react@19.2.6";
import { Banner, Button, Field, Input, Modal, Select, Textarea } from "./../ui.js";
import { INSPECTION_ITEMS } from "./../../data/seed.js";
import { useStore } from "./../../state/store.js";
import { cn } from "./../../utils/cn.js";
/* ----------------------- Vehicle inspection ------------------------ */
export function InspectionModal({ vehicleId, open, onClose, driverId, }) {
    const { state, dispatch, toast } = useStore();
    const [items, setItems] = useState(INSPECTION_ITEMS.map((i) => ({ name: i.name, critical: i.critical, result: "Pass", notes: "" })));
    if (!vehicleId)
        return null;
    const vehicle = state.vehicles.find((v) => v.id === vehicleId);
    const fails = items.filter((i) => i.result === "Fail");
    const criticalFail = fails.some((f) => f.critical);
    const setItem = (name, patch) => setItems((prev) => prev.map((i) => (i.name === name ? { ...i, ...patch } : i)));
    return (_jsxs(Modal, { open: open, onClose: onClose, title: `Vehicle inspection — ${vehicleId}`, subtitle: `${vehicle?.model} · ${vehicle?.registration} · 13-point pre-shift check`, size: "lg", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: criticalFail ? "danger" : "primary", icon: "clipboard", onClick: () => {
                        dispatch({ type: "SUBMIT_INSPECTION", vehicleId, driverId: driverId ?? vehicle?.driverId ?? state.session.driverId, items });
                        toast({
                            tone: criticalFail ? "critical" : "success",
                            title: criticalFail ? "Inspection failed — vehicle blocked" : "Inspection passed",
                            message: criticalFail
                                ? `${vehicleId} is now marked Inspection Required and cannot be dispatched.`
                                : `${vehicleId} is cleared for dispatch.`,
                        });
                        onClose();
                        setItems(INSPECTION_ITEMS.map((i) => ({ name: i.name, critical: i.critical, result: "Pass", notes: "" })));
                    }, children: "Submit inspection" })] }), children: [criticalFail && (_jsx("div", { className: "mb-3", children: _jsxs(Banner, { tone: "critical", icon: "warning", title: "Critical item failed", children: ["Submitting will set ", vehicleId, " to \u201CInspection Required\u201D, block it from dispatch and raise a repair job automatically."] }) })), _jsx("ul", { className: "divide-y divide-mist-200 rounded-md border border-mist-200", children: items.map((item) => (_jsxs("li", { className: "flex flex-wrap items-center gap-3 px-3 py-2.5", children: [_jsxs("span", { className: "min-w-[150px] flex-1 text-[13.5px] font-medium text-charcoal-900", children: [item.name, item.critical && _jsx("span", { className: "ml-1.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700", children: "Critical" })] }), _jsx("div", { className: "flex gap-1", role: "group", "aria-label": `${item.name} result`, children: ["Pass", "Fail"].map((r) => (_jsx("button", { onClick: () => setItem(item.name, { result: r }), "aria-pressed": item.result === r, className: cn("h-8 rounded-md border px-3 text-[12.5px] font-semibold", item.result === r
                                    ? r === "Pass"
                                        ? "border-brand-600 bg-brand-500 text-white"
                                        : "border-red-700 bg-red-600 text-white"
                                    : "border-mist-300 bg-white text-charcoal-500 hover:bg-mist-50"), children: r }, r))) }), _jsx("input", { value: item.notes, onChange: (e) => setItem(item.name, { notes: e.target.value }), placeholder: "Notes", "aria-label": `${item.name} notes`, className: "h-8 w-full rounded-md border border-mist-300 px-2 text-[12.5px] sm:w-44" })] }, item.name))) }), _jsx("p", { className: "mt-3 text-[12.5px] text-charcoal-400", children: fails.length === 0 ? "All 13 checks passing." : `${fails.length} item(s) failing: ${fails.map((f) => f.name).join(", ")}.` })] }));
}
/* ------------------------- Maintenance job ------------------------- */
export function MaintenanceModal({ open, onClose, vehicleId }) {
    const { state, dispatch, toast } = useStore();
    const [form, setForm] = useState({
        vehicleId: vehicleId ?? state.vehicles[0].id,
        service: "10 000 km minor service",
        date: state.today,
        technician: "Willem Grobler",
        cost: 850,
        status: "Scheduled",
        notes: "",
    });
    const vehicle = state.vehicles.find((v) => v.id === form.vehicleId);
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Book maintenance", subtitle: "Schedule workshop time for a vehicle", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", icon: "wrench", onClick: () => {
                        dispatch({ type: "CREATE_MAINTENANCE", job: { ...form, mileage: vehicle?.mileageKm ?? 0 } });
                        toast({ tone: "success", title: "Maintenance booked", message: `${form.vehicleId} · ${form.service}` });
                        onClose();
                    }, children: "Book job" })] }), children: _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Vehicle", required: true, children: _jsx(Select, { value: form.vehicleId, onChange: (e) => setForm({ ...form, vehicleId: e.target.value }), options: state.vehicles.map((v) => ({ value: v.id, label: `${v.id} · ${v.registration}` })) }) }), _jsx(Field, { label: "Service", required: true, children: _jsx(Select, { value: form.service, onChange: (e) => setForm({ ...form, service: e.target.value }), options: ["10 000 km minor service", "20 000 km major service", "Brake pad replacement", "Tyre replacement (rear pair)", "Chain & sprocket service", "Battery health check", "Cargo box repair", "Electrical repair"].map((s) => ({ value: s, label: s })) }) }), _jsx(Field, { label: "Date", required: true, children: _jsx(Input, { type: "date", value: form.date, onChange: (e) => setForm({ ...form, date: e.target.value }) }) }), _jsx(Field, { label: "Technician", children: _jsx(Select, { value: form.technician, onChange: (e) => setForm({ ...form, technician: e.target.value }), options: ["Willem Grobler", "Sipho Mahlangu", "Ravi Chetty", "Dumisani Khoza", "Unassigned"].map((t) => ({ value: t, label: t })) }) }), _jsx(Field, { label: "Estimated cost (R)", children: _jsx(Input, { type: "number", value: form.cost, onChange: (e) => setForm({ ...form, cost: Number(e.target.value) }) }) }), _jsx(Field, { label: "Notes", className: "sm:col-span-2", children: _jsx(Textarea, { value: form.notes, onChange: (e) => setForm({ ...form, notes: e.target.value }) }) })] }) }));
}
/* --------------------------- Safety forms -------------------------- */
export function IncidentModal({ open, onClose, defaults }) {
    const { state, dispatch, toast } = useStore();
    const [form, setForm] = useState({
        type: "Minor collision",
        date: state.today,
        time: new Date().toTimeString().slice(0, 5),
        location: "Johannesburg CBD",
        driverId: defaults?.driverId ?? state.drivers[0].id,
        vehicleId: defaults?.vehicleId ?? state.vehicles[0].id,
        severity: "Medium",
        description: "",
        correctiveAction: "",
        preventable: true,
    });
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Report a safety incident", subtitle: "Recorded in the Safety Dashboard, driver record and notifications", size: "lg", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "danger", icon: "shield", disabled: form.description.trim().length < 5, onClick: () => {
                        dispatch({
                            type: "REPORT_INCIDENT",
                            incident: { ...form, deliveryId: defaults?.deliveryId ?? null, status: "Open" },
                        });
                        toast({ tone: "critical", title: "Safety incident logged", message: `${form.type} · ${form.location}` });
                        onClose();
                    }, children: "Submit incident" })] }), children: _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Incident type", required: true, children: _jsx(Select, { value: form.type, onChange: (e) => setForm({ ...form, type: e.target.value }), options: ["Minor collision", "Parcel damage", "Attempted theft", "Tyre blowout", "Vehicle breakdown", "Injury", "Road rage / conflict", "Cargo loss"].map((t) => ({ value: t, label: t })) }) }), _jsx(Field, { label: "Severity", required: true, children: _jsx(Select, { value: form.severity, onChange: (e) => setForm({ ...form, severity: e.target.value }), options: ["Low", "Medium", "High", "Critical"].map((s) => ({ value: s, label: s })) }) }), _jsx(Field, { label: "Date", required: true, children: _jsx(Input, { type: "date", value: form.date, onChange: (e) => setForm({ ...form, date: e.target.value }) }) }), _jsx(Field, { label: "Time", required: true, children: _jsx(Input, { type: "time", value: form.time, onChange: (e) => setForm({ ...form, time: e.target.value }) }) }), _jsx(Field, { label: "Location", required: true, children: _jsx(Input, { value: form.location, onChange: (e) => setForm({ ...form, location: e.target.value }) }) }), _jsx(Field, { label: "Driver", children: _jsx(Select, { value: form.driverId, onChange: (e) => setForm({ ...form, driverId: e.target.value }), options: state.drivers.map((d) => ({ value: d.id, label: d.name })) }) }), _jsx(Field, { label: "Vehicle", children: _jsx(Select, { value: form.vehicleId, onChange: (e) => setForm({ ...form, vehicleId: e.target.value }), options: state.vehicles.map((v) => ({ value: v.id, label: v.id })) }) }), _jsx(Field, { label: "Preventable?", children: _jsx(Select, { value: form.preventable ? "yes" : "no", onChange: (e) => setForm({ ...form, preventable: e.target.value === "yes" }), options: [{ value: "yes", label: "Yes — preventable" }, { value: "no", label: "No — non-preventable" }] }) }), _jsx(Field, { label: "What happened?", required: true, className: "sm:col-span-2", children: _jsx(Textarea, { value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), placeholder: "Describe the incident factually" }) }), _jsx(Field, { label: "Corrective action", className: "sm:col-span-2", children: _jsx(Textarea, { value: form.correctiveAction, onChange: (e) => setForm({ ...form, correctiveAction: e.target.value }), placeholder: "What will prevent this happening again?" }) })] }) }));
}
export function NearMissModal({ open, onClose, defaults }) {
    const { state, dispatch, toast } = useStore();
    const [form, setForm] = useState({
        driverId: defaults?.driverId ?? state.drivers[0].id,
        vehicleId: defaults?.vehicleId ?? state.vehicles[0].id,
        location: "Sandton",
        date: state.today,
        time: new Date().toTimeString().slice(0, 5),
        riskType: "Cut-off by taxi",
        description: "",
        action: "",
    });
    return (_jsx(Modal, { open: open, onClose: onClose, title: "Report a near miss", subtitle: "Near misses help prevent incidents \u2014 reporting is encouraged and blame-free", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }), _jsx(Button, { variant: "primary", icon: "eye", disabled: form.description.trim().length < 5, onClick: () => {
                        dispatch({ type: "REPORT_NEAR_MISS", nearMiss: form });
                        toast({ tone: "success", title: "Near miss reported", message: "Thank you — the safety team has been notified." });
                        onClose();
                    }, children: "Submit near miss" })] }), children: _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "Driver", required: true, children: _jsx(Select, { value: form.driverId, onChange: (e) => setForm({ ...form, driverId: e.target.value }), options: state.drivers.map((d) => ({ value: d.id, label: d.name })) }) }), _jsx(Field, { label: "Vehicle", children: _jsx(Select, { value: form.vehicleId, onChange: (e) => setForm({ ...form, vehicleId: e.target.value }), options: state.vehicles.map((v) => ({ value: v.id, label: v.id })) }) }), _jsx(Field, { label: "Risk type", required: true, children: _jsx(Select, { value: form.riskType, onChange: (e) => setForm({ ...form, riskType: e.target.value }), options: ["Cut-off by taxi", "Pedestrian", "Poor road surface", "Wet weather", "Load shift", "Visibility", "Aggressive driver", "Loadshedding — traffic lights out"].map((r) => ({ value: r, label: r })) }) }), _jsx(Field, { label: "Location", required: true, children: _jsx(Input, { value: form.location, onChange: (e) => setForm({ ...form, location: e.target.value }) }) }), _jsx(Field, { label: "Date", children: _jsx(Input, { type: "date", value: form.date, onChange: (e) => setForm({ ...form, date: e.target.value }) }) }), _jsx(Field, { label: "Time", children: _jsx(Input, { type: "time", value: form.time, onChange: (e) => setForm({ ...form, time: e.target.value }) }) }), _jsx(Field, { label: "What happened?", required: true, className: "sm:col-span-2", children: _jsx(Textarea, { value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }) }) }), _jsx(Field, { label: "Action taken / suggested", className: "sm:col-span-2", children: _jsx(Textarea, { value: form.action, onChange: (e) => setForm({ ...form, action: e.target.value }) }) })] }) }));
}
