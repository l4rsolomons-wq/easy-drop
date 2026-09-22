import { useMemo, useRef, useState } from "react";
import { Badge, Banner, Button, Card, CardHeader, Field, Input, KeyValue, Modal, Select, StatusBadge, Textarea, Drawer } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { SERVICES, SUBURBS } from "@/data/seed";
import { useStore } from "@/state/store";
import { canDispatch } from "@/state/selectors";
import type { Delivery, Priority, ServiceType } from "@/types";
import { dateTimeSA, kg, time24, zar } from "@/lib/format";
import { useRouter } from "@/router";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ */
/* Create delivery                                                     */
/* ------------------------------------------------------------------ */

const STEPS = ["Customer & pickup", "Recipient & destination", "Parcel & service"];

export function CreateDeliveryModal({
  open,
  onClose,
  source = "Operations",
  lockCustomerId,
}: {
  open: boolean;
  onClose: () => void;
  source?: Delivery["createdBy"];
  lockCustomerId?: string;
}) {
  const { state, dispatch, toast } = useStore();
  const { navigate } = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    customerId: lockCustomerId ?? state.customers[0].id,
    pickup: "",
    recipient: "",
    phone: "",
    destination: "",
    suburb: "Sandton",
    parcels: 1,
    weightKg: 2.5,
    service: "Standard Local" as ServiceType,
    priority: "Standard" as Priority,
    window: "09:00 – 13:00",
    instructions: "",
    notes: "",
  });
  const customer = state.customers.find((c) => c.id === form.customerId) ?? state.customers[0];
  const pickupOptions = customer.pickupLocations;
  const pickup = form.pickup || pickupOptions[0];
  const zone = SUBURBS.find((s) => s.name === form.suburb)?.zone;
  const suggestedRoute = state.routes.find((r) => r.zone === zone);
  const price = useMemo(() => {
    const base = { "Standard Local": 30, "Extended Urban": 45, "Same-Day Priority": 75, "Scheduled Route": 38, "Reverse Logistics": 55 }[form.service];
    return base + (form.priority === "Urgent" ? 20 : form.priority === "High" ? 10 : 0);
  }, [form.service, form.priority]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const valid =
    step === 0
      ? !!form.customerId && !!pickup
      : step === 1
        ? form.recipient.trim().length > 1 && form.phone.trim().length > 5 && form.destination.trim().length > 2
        : form.parcels > 0 && form.weightKg > 0;

  const submit = () => {
    const before = state.deliveries.length;
    dispatch({ type: "CREATE_DELIVERY", input: { ...form, pickup, source } });
    const newId = `DW-${state.deliveries.reduce((m, d) => Math.max(m, Number(d.id.replace("DW-", "")) || 0), 10000) + 1}`;
    toast({
      tone: "success",
      title: `Delivery ${newId} created`,
      message: `${form.service} to ${form.suburb}. It is now waiting for dispatch.`,
    });
    onClose();
    setStep(0);
    setForm((f) => ({ ...f, recipient: "", phone: "", destination: "", instructions: "", notes: "" }));
    if (before >= 0 && source === "Operations") navigate(`/ops/deliveries?id=${newId}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New delivery"
      subtitle="Create a booking. It appears immediately in Deliveries, Dispatch and the customer portal."
      size="lg"
      footer={
        <>
          <span className="mr-auto hidden text-[12px] text-charcoal-400 sm:block">
            Step {step + 1} of 3 · {STEPS[step]}
          </span>
          {step > 0 && (
            <Button variant="ghost" icon="chevronLeft" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button variant="primary" icon="arrowRight" disabled={!valid} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" icon="check" disabled={!valid} onClick={submit}>
              Create delivery
            </Button>
          )}
        </>
      }
    >
      <ol className="mb-5 flex flex-wrap gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                i < step ? "bg-brand-500 text-white" : i === step ? "bg-navy-950 text-white" : "bg-mist-200 text-charcoal-400",
              )}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={cn("truncate text-[12.5px] font-semibold", i === step ? "text-navy-950" : "text-charcoal-400")}>{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business customer" required>
            <Select
              value={form.customerId}
              disabled={!!lockCustomerId}
              onChange={(e) => set("customerId", e.target.value)}
              options={state.customers.map((c) => ({ value: c.id, label: `${c.business} · ${c.industry}` }))}
            />
          </Field>
          <Field label="Pickup location" required>
            <Select value={pickup} onChange={(e) => set("pickup", e.target.value)} options={pickupOptions.map((p) => ({ value: p, label: p }))} />
          </Field>
          <Field label="Collection window" className="sm:col-span-2">
            <Select
              value={form.window}
              onChange={(e) => set("window", e.target.value)}
              options={["08:00 – 12:00", "09:00 – 13:00", "12:00 – 16:00", "14:00 – 18:00"].map((w) => ({ value: w, label: w }))}
            />
          </Field>
          <div className="sm:col-span-2">
            <Banner tone="info" icon="info" title="What happens next">
              Once created, the booking is queued at the City Deep Hub and appears on the Dispatch board for driver, vehicle and route assignment.
            </Banner>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recipient name" required>
            <Input value={form.recipient} onChange={(e) => set("recipient", e.target.value)} placeholder="e.g. Naledi Mokoena" />
          </Field>
          <Field label="Recipient phone" required>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 082 555 1234" inputMode="tel" />
          </Field>
          <Field label="Street address" required className="sm:col-span-2">
            <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="e.g. 12 Rivonia Rd" />
          </Field>
          <Field label="Suburb" required hint={suggestedRoute ? `Matches ${suggestedRoute.id} · ${suggestedRoute.name}` : undefined}>
            <Select value={form.suburb} onChange={(e) => set("suburb", e.target.value)} options={SUBURBS.map((s) => ({ value: s.name, label: s.name }))} />
          </Field>
          <Field label="Delivery instructions">
            <Input value={form.instructions} onChange={(e) => set("instructions", e.target.value)} placeholder="e.g. Ring the buzzer at the gate" />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Number of parcels" required>
            <Input type="number" min={1} max={40} value={form.parcels} onChange={(e) => set("parcels", Number(e.target.value))} />
          </Field>
          <Field label="Total weight (kg)" required>
            <Input type="number" min={0.1} step={0.1} value={form.weightKg} onChange={(e) => set("weightKg", Number(e.target.value))} />
          </Field>
          <Field label="Service" required>
            <Select value={form.service} onChange={(e) => set("service", e.target.value as ServiceType)} options={SERVICES.map((s) => ({ value: s, label: s }))} />
          </Field>
          <Field label="Priority" required>
            <Select value={form.priority} onChange={(e) => set("priority", e.target.value as Priority)} options={["Standard", "High", "Urgent"].map((p) => ({ value: p, label: p }))} />
          </Field>
          <Field label="Notes for the operations team" className="sm:col-span-2">
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Anything the hub or driver should know" />
          </Field>
          <div className="sm:col-span-2 rounded-md border border-mist-200 bg-mist-50 p-3">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-wide text-charcoal-400">Booking summary</p>
            <KeyValue
              cols={3}
              items={[
                ["Customer", customer.business],
                ["Pickup", pickup],
                ["Destination", `${form.destination || "—"}, ${form.suburb}`],
                ["Parcels", `${form.parcels} · ${kg(form.weightKg)}`],
                ["Service", `${form.service} (${form.priority})`],
                ["Estimated price", <span className="font-bold text-brand-700">{zar(price)}</span>],
              ]}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Assign driver / vehicle / route                                     */
/* ------------------------------------------------------------------ */

export function AssignModal({ deliveryId, open, onClose }: { deliveryId: string | null; open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useStore();
  const delivery = state.deliveries.find((d) => d.id === deliveryId);
  const zone = SUBURBS.find((s) => s.name === delivery?.suburb)?.zone;
  const suggested = state.routes.find((r) => r.zone === zone);
  const [driverId, setDriverId] = useState<string>("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [routeId, setRouteId] = useState<string>("");

  const effectiveRoute = routeId || suggested?.id || state.routes[0].id;
  const route = state.routes.find((r) => r.id === effectiveRoute);
  const effectiveDriver = driverId || route?.driverId || state.drivers[0].id;
  const effectiveVehicle = vehicleId || route?.vehicleId || state.vehicles[0].id;
  const check = canDispatch(state, effectiveVehicle);

  if (!delivery) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign ${delivery.id}`}
      subtitle="Choose who delivers this parcel, on which vehicle and route."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon="check"
            onClick={() => {
              dispatch({ type: "ASSIGN_DELIVERY", id: delivery.id, driverId: effectiveDriver, vehicleId: effectiveVehicle, routeId: effectiveRoute });
              toast({ tone: "success", title: "Delivery assigned", message: `${delivery.id} → ${state.drivers.find((d) => d.id === effectiveDriver)?.name} on ${effectiveVehicle}` });
              onClose();
            }}
          >
            Confirm assignment
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Route" hint={suggested ? `Suggested: ${suggested.id}` : undefined}>
          <Select
            value={effectiveRoute}
            onChange={(e) => setRouteId(e.target.value)}
            options={state.routes.map((r) => ({ value: r.id, label: `${r.id} · ${r.name}` }))}
          />
        </Field>
        <Field label="Driver">
          <Select
            value={effectiveDriver}
            onChange={(e) => setDriverId(e.target.value)}
            options={state.drivers.map((d) => ({ value: d.id, label: `${d.name} · ${d.status}`, disabled: d.status === "On Leave" }))}
          />
        </Field>
        <Field label="Vehicle">
          <Select
            value={effectiveVehicle}
            onChange={(e) => setVehicleId(e.target.value)}
            options={state.vehicles.map((v) => ({
              value: v.id,
              label: `${v.id} · ${v.status}`,
            }))}
          />
        </Field>
      </div>
      <div className="mt-4">
        {check.ok ? (
          <Banner tone="success" icon="check" title="Vehicle cleared for dispatch">
            {effectiveVehicle} passed its inspection and has no blocking maintenance.
          </Banner>
        ) : (
          <Banner tone="critical" icon="warning" title="This vehicle cannot be dispatched">
            {check.reason}. Choose another vehicle or resolve the issue in Fleet → Maintenance.
          </Banner>
        )}
      </div>
      <div className="mt-4 rounded-md border border-mist-200 bg-mist-50 p-3">
        <KeyValue
          cols={3}
          items={[
            ["Destination", `${delivery.destination}, ${delivery.suburb}`],
            ["Service", delivery.service],
            ["Parcels", `${delivery.parcels} · ${kg(delivery.weightKg)}`],
          ]}
        />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Signature pad + POD                                                 */
/* ------------------------------------------------------------------ */

export function SignaturePad({ value, onChange }: { value: string; onChange: (path: string) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);

  const point = (e: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300;
    const y = ((e.clientY - rect.top) / rect.height) * 110;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  return (
    <div>
      <svg
        ref={ref}
        viewBox="0 0 300 110"
        className="h-[110px] w-full touch-none rounded-md border-2 border-dashed border-mist-300 bg-white"
        onPointerDown={(e) => {
          drawing.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
          onChange(`${value} M${point(e)}`.trim());
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          onChange(`${value} L${point(e)}`);
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
        role="img"
        aria-label="Signature capture area"
      >
        <path d={value} fill="none" stroke="#081120" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {!value && (
          <text x="150" y="60" textAnchor="middle" fontSize="12" fill="#93a4bb">
            Sign here with a finger or mouse
          </text>
        )}
      </svg>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[11.5px] text-charcoal-400">Simulated capture — no data leaves this device.</span>
        <Button size="xs" variant="ghost" icon="refresh" onClick={() => onChange("")}>
          Clear
        </Button>
      </div>
    </div>
  );
}

export function PodModal({ deliveryId, open, onClose }: { deliveryId: string | null; open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useStore();
  const delivery = state.deliveries.find((d) => d.id === deliveryId);
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState("");
  const [photo, setPhoto] = useState("");
  const [notes, setNotes] = useState("");

  if (!delivery) return null;
  const name = recipient || delivery.recipient;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Capture proof of delivery"
      subtitle={`${delivery.id} · ${delivery.destination}, ${delivery.suburb}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon="check"
            disabled={!signature || (state.settings.podPhotoRequired && !photo)}
            onClick={() => {
              dispatch({ type: "CAPTURE_POD", id: delivery.id, recipient: name, notes, photo, signature });
              toast({ tone: "success", title: "DELIVERY COMPLETE", message: `${delivery.id} · POD captured and shared with the customer.` });
              onClose();
              setSignature("");
              setPhoto("");
              setNotes("");
              setRecipient("");
            }}
          >
            Confirm delivery complete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Who received the parcel?" required>
          <Input value={name} onChange={(e) => setRecipient(e.target.value)} />
        </Field>
        <Field label="Signature" required>
          <SignaturePad value={signature} onChange={setSignature} />
        </Field>
        <Field label={`Photo${state.settings.podPhotoRequired ? "" : " (optional)"}`} required={state.settings.podPhotoRequired}>
          {photo ? (
            <div className="flex items-center gap-3 rounded-md border border-brand-200 bg-brand-50 p-3">
              <span className="grid h-12 w-16 place-items-center rounded bg-brand-500/15 text-brand-700">
                <Icon name="camera" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-brand-800">Photo captured</p>
                <p className="truncate text-[11.5px] text-brand-700">{photo}</p>
              </div>
              <Button size="xs" variant="ghost" onClick={() => setPhoto("")}>
                Remove
              </Button>
            </div>
          ) : (
            <Button variant="secondary" icon="camera" onClick={() => setPhoto(`Parcel photo captured at ${delivery.suburb} · ${time24(new Date().toISOString())}`)}>
              Capture photo (simulated)
            </Button>
          )}
        </Field>
        <Field label="Delivery notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Handed to security at the gate" />
        </Field>
      </div>
    </Modal>
  );
}

export function FailModal({ deliveryId, open, onClose }: { deliveryId: string | null; open: boolean; onClose: () => void }) {
  const { state, dispatch, toast } = useStore();
  const [reason, setReason] = useState("Recipient not available");
  const [note, setNote] = useState("");
  const delivery = state.deliveries.find((d) => d.id === deliveryId);
  if (!delivery) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a delivery problem"
      subtitle={`${delivery.id} · ${delivery.destination}, ${delivery.suburb}`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            icon="warning"
            onClick={() => {
              dispatch({ type: "FAIL_DELIVERY", id: delivery.id, reason: note ? `${reason} — ${note}` : reason });
              toast({ tone: "warning", title: "Delivery problem logged", message: `${delivery.id} marked as failed. Operations has been notified.` });
              onClose();
            }}
          >
            Log problem
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="What went wrong?" required>
          <Select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={[
              "Recipient not available",
              "Incorrect address",
              "Access denied at complex",
              "Recipient refused parcel",
              "Parcel damaged",
              "Unsafe area — could not deliver",
            ].map((r) => ({ value: r, label: r }))}
          />
        </Field>
        <Field label="Extra detail">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add anything useful for the next attempt" />
        </Field>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Delivery detail drawer                                              */
/* ------------------------------------------------------------------ */

const TIMELINE = ["Created", "Assigned", "Dispatched", "Picked Up", "In Transit", "Delivered"];

export function DeliveryDrawer({
  deliveryId,
  onClose,
  context = "ops",
}: {
  deliveryId: string | null;
  onClose: () => void;
  context?: "ops" | "driver" | "portal";
}) {
  const { state, dispatch, toast } = useStore();
  const { navigate } = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const delivery = state.deliveries.find((d) => d.id === deliveryId);
  if (!delivery) return null;

  const customer = state.customers.find((c) => c.id === delivery.customerId);
  const driver = state.drivers.find((d) => d.id === delivery.driverId);
  const vehicle = state.vehicles.find((v) => v.id === delivery.vehicleId);
  const route = state.routes.find((r) => r.id === delivery.routeId);
  const doneIdx = TIMELINE.findIndex((t) => t === delivery.status);
  const vehicleCheck = delivery.vehicleId ? canDispatch(state, delivery.vehicleId) : { ok: false, reason: "No vehicle assigned" };

  const advance = (status: Delivery["status"], msg: string) => {
    dispatch({ type: "ADVANCE_DELIVERY", id: delivery.id, status });
    toast({ tone: "success", title: msg, message: `${delivery.id} · ${status}` });
  };

  const actions = () => {
    if (context === "portal") return null;
    switch (delivery.status) {
      case "Pending":
      case "Scheduled":
        return (
          <Button variant="primary" icon="users" onClick={() => setAssignOpen(true)}>
            Assign driver & vehicle
          </Button>
        );
      case "Assigned":
        return (
          <>
            <Button
              variant="primary"
              icon="send"
              disabled={!vehicleCheck.ok}
              onClick={() => advance("Dispatched", "Vehicle dispatched")}
            >
              Dispatch
            </Button>
            <Button variant="secondary" icon="edit" onClick={() => setAssignOpen(true)}>
              Reassign
            </Button>
          </>
        );
      case "Dispatched":
        return (
          <Button variant="primary" icon="package" onClick={() => advance("Picked Up", "Parcel collected")}>
            Mark picked up
          </Button>
        );
      case "Picked Up":
        return (
          <Button variant="primary" icon="truck" onClick={() => advance("In Transit", "Parcel in transit")}>
            Mark in transit
          </Button>
        );
      case "In Transit":
        return (
          <>
            <Button variant="primary" icon="check" onClick={() => setPodOpen(true)}>
              Mark delivered & capture POD
            </Button>
            <Button variant="danger" icon="warning" onClick={() => setFailOpen(true)}>
              Report failure
            </Button>
          </>
        );
      case "Delivered":
        return (
          <Button variant="secondary" icon="clipboard" onClick={() => setPodOpen(delivery.pod ? false : true)} disabled={!!delivery.pod}>
            {delivery.pod ? "POD captured" : "Capture POD"}
          </Button>
        );
      case "Failed":
        return (
          <>
            <Button variant="primary" icon="refresh" onClick={() => { dispatch({ type: "RESOLVE_FAILED", id: delivery.id, mode: "retry" }); toast({ tone: "info", title: "Retry scheduled" }); }}>
              Retry
            </Button>
            <Button variant="secondary" icon="calendar" onClick={() => { dispatch({ type: "RESOLVE_FAILED", id: delivery.id, mode: "reschedule" }); toast({ tone: "info", title: "Delivery rescheduled" }); }}>
              Reschedule
            </Button>
            <Button variant="secondary" icon="hub" onClick={() => { dispatch({ type: "RESOLVE_FAILED", id: delivery.id, mode: "return" }); toast({ tone: "info", title: "Returned to hub" }); }}>
              Return to hub
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Drawer
        open={!!deliveryId}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2">
            {delivery.id}
            <StatusBadge status={delivery.status} />
            {delivery.priority !== "Standard" && <Badge tone={delivery.priority === "Urgent" ? "critical" : "warning"}>{delivery.priority}</Badge>}
          </span>
        }
        subtitle={`${customer?.business} · ${delivery.service} · created ${dateTimeSA(delivery.createdAt)}`}
        footer={<div className="flex flex-wrap gap-2">{actions()}</div>}
      >
        {!vehicleCheck.ok && delivery.status === "Assigned" && (
          <Banner tone="critical" icon="warning" title="Dispatch blocked">
            {vehicleCheck.reason}
          </Banner>
        )}

        <Card>
          <CardHeader title="Delivery timeline" icon="clock" subtitle="Every status change is recorded" />
          <ol className="space-y-0 px-4 py-3">
            {TIMELINE.map((label, i) => {
              const event = delivery.events.find((e) => e.label === label);
              const complete = !!event || (doneIdx >= 0 && i <= doneIdx);
              return (
                <li key={label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn("grid h-5 w-5 place-items-center rounded-full border-2 text-[10px] font-bold", complete ? "border-brand-500 bg-brand-500 text-white" : "border-mist-300 bg-white text-charcoal-400")}>
                      {complete ? "✓" : i + 1}
                    </span>
                    {i < TIMELINE.length - 1 && <span className={cn("my-0.5 w-0.5 flex-1", complete ? "bg-brand-300" : "bg-mist-200")} style={{ minHeight: 18 }} />}
                  </div>
                  <div className="pb-3">
                    <p className={cn("text-[13px] font-semibold", complete ? "text-navy-950" : "text-charcoal-400")}>{label}</p>
                    {event ? (
                      <p className="text-[12px] text-charcoal-400">
                        {time24(event.at)} · {event.detail} {event.actor ? `· ${event.actor}` : ""}
                      </p>
                    ) : (
                      <p className="text-[12px] text-charcoal-400">Not yet</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {delivery.events.some((e) => !TIMELINE.includes(e.label)) && (
            <div className="border-t border-mist-200 px-4 py-3">
              <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Other events</p>
              <ul className="space-y-1">
                {delivery.events.filter((e) => !TIMELINE.includes(e.label)).map((e, i) => (
                  <li key={i} className="text-[12.5px] text-charcoal-500">
                    <span className="num font-semibold text-navy-950">{time24(e.at)}</span> · {e.label} {e.detail ? `— ${e.detail}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Delivery details" icon="package" />
          <div className="px-4 py-3">
            <KeyValue
              items={[
                ["Business customer", customer?.business ?? "—"],
                ["Recipient", delivery.recipient],
                ["Phone", delivery.phone],
                ["Pickup", delivery.pickup],
                ["Destination", `${delivery.destination}, ${delivery.suburb}`],
                ["Parcels", `${delivery.parcels} parcel${delivery.parcels > 1 ? "s" : ""}`],
                ["Weight", kg(delivery.weightKg)],
                ["Service", delivery.service],
                ["Priority", delivery.priority],
                ["Delivery window", delivery.window],
                ["ETA", time24(delivery.eta)],
                ["Price", zar(delivery.price)],
                ["Hub stage", delivery.hubStage],
                ["Booked via", delivery.createdBy],
              ]}
            />
            {delivery.instructions && (
              <p className="mt-3 rounded border border-mist-200 bg-mist-50 px-3 py-2 text-[12.5px] text-charcoal-700">
                <span className="font-semibold">Instructions:</span> {delivery.instructions}
              </p>
            )}
            {delivery.failureReason && (
              <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-800">
                <span className="font-semibold">Problem:</span> {delivery.failureReason}
              </p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Assignment" icon="users" subtitle="Driver, vehicle and route handling this parcel" />
          <div className="px-4 py-3">
            {driver || vehicle || route ? (
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Driver", value: driver?.name ?? "Unassigned", to: driver ? `/ops/drivers?id=${driver.id}` : null, icon: "user" },
                  { label: "Vehicle", value: vehicle?.id ?? "Unassigned", to: vehicle ? `/ops/vehicles?id=${vehicle.id}` : null, icon: "truck" },
                  { label: "Route", value: route ? `${route.id} · ${route.name}` : "Unassigned", to: route ? `/ops/routes?id=${route.id}` : null, icon: "route" },
                ].map((x) => (
                  <button
                    key={x.label}
                    disabled={!x.to || context !== "ops"}
                    onClick={() => x.to && navigate(x.to)}
                    className="rounded-md border border-mist-200 bg-mist-50 p-2.5 text-left hover:border-brand-300 disabled:cursor-default"
                  >
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-charcoal-400">
                      <Icon name={x.icon} className="h-3.5 w-3.5" /> {x.label}
                    </span>
                    <span className="mt-1 block truncate text-[13px] font-semibold text-navy-950">{x.value}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-charcoal-400">Not yet assigned — send it to Dispatch to allocate a driver, vehicle and route.</p>
            )}
          </div>
        </Card>

        {delivery.pod && (
          <Card>
            <CardHeader title="Proof of delivery" icon="clipboard" subtitle={`Captured ${dateTimeSA(delivery.pod.capturedAt)}`} />
            <div className="space-y-3 px-4 py-3">
              <svg viewBox="0 0 300 110" className="h-24 w-full rounded border border-mist-200 bg-white">
                <path d={delivery.pod.signature} fill="none" stroke="#081120" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <div className="flex items-center gap-3 rounded border border-mist-200 bg-mist-50 p-2.5">
                <span className="grid h-10 w-14 place-items-center rounded bg-navy-950/5 text-navy-700">
                  <Icon name="camera" className="h-4 w-4" />
                </span>
                <p className="text-[12.5px] text-charcoal-700">{delivery.pod.photo}</p>
              </div>
              <KeyValue
                items={[
                  ["Signed by", delivery.pod.recipient],
                  ["Location", delivery.pod.location],
                  ["Driver", state.drivers.find((d) => d.id === delivery.pod?.driverId)?.name ?? "—"],
                  ["Vehicle", delivery.pod.vehicleId],
                ]}
              />
              {delivery.pod.notes && <p className="text-[12.5px] text-charcoal-500">Notes: {delivery.pod.notes}</p>}
            </div>
          </Card>
        )}
      </Drawer>

      <AssignModal deliveryId={assignOpen ? delivery.id : null} open={assignOpen} onClose={() => setAssignOpen(false)} />
      <PodModal deliveryId={podOpen ? delivery.id : null} open={podOpen} onClose={() => setPodOpen(false)} />
      <FailModal deliveryId={failOpen ? delivery.id : null} open={failOpen} onClose={() => setFailOpen(false)} />
    </>
  );
}
