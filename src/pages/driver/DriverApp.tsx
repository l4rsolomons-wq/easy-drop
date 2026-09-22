import { useState } from "react";
import { Icon, Logo, type IconName } from "@/components/Icon";
import { Badge, Banner, Button, Progress, StatusBadge } from "@/components/ui";
import { FailModal, PodModal } from "@/components/workflow/DeliveryWorkflows";
import { InspectionModal, IncidentModal, NearMissModal } from "@/components/workflow/FleetWorkflows";
import { dateSA, initials, km, num, pct, time24 } from "@/lib/format";
import { Link, useRouter } from "@/router";
import { useStore } from "@/state/store";
import type { Delivery } from "@/types";
import { cn } from "@/utils/cn";

const TABS: { key: string; label: string; icon: IconName | string; to: string }[] = [
  { key: "home", label: "Home", icon: "home", to: "/driver" },
  { key: "route", label: "Route", icon: "route", to: "/driver/route" },
  { key: "deliveries", label: "Deliveries", icon: "package", to: "/driver/deliveries" },
  { key: "vehicle", label: "Vehicle", icon: "truck", to: "/driver/vehicle" },
  { key: "more", label: "More", icon: "menu", to: "/driver/more" },
];

const Tile = ({ label, value, tone = "navy" }: { label: string; value: string | number; tone?: "navy" | "green" | "amber" }) => (
  <div className={cn("rounded-lg p-3", tone === "green" ? "bg-brand-50" : tone === "amber" ? "bg-amber-50" : "bg-mist-100")}>
    <p className="num text-[22px] font-bold leading-none text-navy-950">{value}</p>
    <p className="mt-1 text-[11.5px] font-medium text-charcoal-500">{label}</p>
  </div>
);

const ActionButton = ({ icon, label, onClick, tone = "secondary", disabled }: { icon: IconName | string; label: string; onClick: () => void; tone?: "primary" | "secondary" | "danger"; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex min-h-[74px] flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 text-center text-[12px] font-semibold transition-colors disabled:opacity-40",
      tone === "primary" ? "border-brand-600 bg-brand-500 text-white" : tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-mist-200 bg-white text-charcoal-700 hover:bg-mist-50",
    )}
  >
    <Icon name={icon} className="h-5 w-5" />
    {label}
  </button>
);

export default function DriverApp({ page }: { page: string }) {
  const { state, dispatch, toast } = useStore();
  const { params, setParam, navigate } = useRouter();
  const [inspectOpen, setInspectOpen] = useState(false);
  const [podId, setPodId] = useState<string | null>(null);
  const [failId, setFailId] = useState<string | null>(null);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [nearMissOpen, setNearMissOpen] = useState(false);

  const driverId = state.session.driverId;
  const driver = state.drivers.find((d) => d.id === driverId) ?? state.drivers[0];
  const vehicle = state.vehicles.find((v) => v.id === driver.vehicleId) ?? state.vehicles[0];
  const route = state.routes.find((r) => r.id === driver.routeId) ?? state.routes[0];
  const myDeliveries = state.deliveries.filter((d) => d.driverId === driver.id);
  const completed = myDeliveries.filter((d) => d.status === "Delivered");
  const remaining = myDeliveries.filter((d) => !["Delivered", "Failed", "Returned"].includes(d.status));
  const nextStop = remaining[0];
  const openDelivery = state.deliveries.find((d) => d.id === params.get("d"));
  const inspectedToday = state.inspections.some((i) => i.vehicleId === vehicle.id && i.date === state.today);
  const blocked = vehicle.status === "Inspection Required" || vehicle.status === "Maintenance" || vehicle.status === "Out of Service";

  const advance = (d: Delivery, status: Delivery["status"], msg: string) => {
    dispatch({ type: "ADVANCE_DELIVERY", id: d.id, status });
    toast({ tone: "success", title: msg, message: `${d.id} · ${status}` });
  };

  /* ----------------------------- screens ---------------------------- */

  const Home = (
    <div className="space-y-3 p-3">
      <div className="rounded-lg bg-navy-950 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-[14px] font-bold">{initials(driver.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">{driver.name}</p>
            <p className="text-[12px] text-mist-300">{driver.id} · {driver.zone}</p>
          </div>
          <Badge tone={driver.shiftStarted ? "success" : "warning"} dot>{driver.shiftStarted ? "On shift" : "Off shift"}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-white/10 py-2">
            <p className="num text-[20px] font-bold">{myDeliveries.length}</p>
            <p className="text-[10.5px] text-mist-300">Today</p>
          </div>
          <div className="rounded-md bg-white/10 py-2">
            <p className="num text-[20px] font-bold text-brand-300">{completed.length}</p>
            <p className="text-[10.5px] text-mist-300">Completed</p>
          </div>
          <div className="rounded-md bg-white/10 py-2">
            <p className="num text-[20px] font-bold text-amber-300">{remaining.length}</p>
            <p className="text-[10.5px] text-mist-300">Remaining</p>
          </div>
        </div>
        <div className="mt-3">
          <Progress value={(completed.length / Math.max(1, myDeliveries.length)) * 100} />
        </div>
      </div>

      {blocked && (
        <Banner tone="critical" icon="warning" title={`${vehicle.id} is ${vehicle.status.toLowerCase()}`}>
          {vehicle.blockedReason ?? "You cannot start a route until this is resolved. Contact the hub controller."}
        </Banner>
      )}
      {!inspectedToday && !blocked && (
        <Banner tone="warning" icon="clipboard" title="Vehicle inspection outstanding" action={<Button size="sm" variant="primary" onClick={() => setInspectOpen(true)}>Inspect</Button>}>
          Complete the 13-point check before you start your route.
        </Banner>
      )}

      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Next stop</p>
        {nextStop ? (
          <>
            <p className="mt-1 text-[15px] font-bold text-navy-950">{nextStop.destination}, {nextStop.suburb}</p>
            <p className="text-[12.5px] text-charcoal-500">{nextStop.recipient} · {nextStop.phone}</p>
            <p className="mt-1 text-[12.5px] text-charcoal-400">{nextStop.id} · {nextStop.parcels} parcel(s) · {nextStop.weightKg} kg · ETA {time24(nextStop.eta)}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" icon="arrowRight" className="flex-1" onClick={() => setParam("d", nextStop.id)}>Open stop</Button>
              <Button variant="secondary" icon="phone" onClick={() => toast({ tone: "info", title: "Calling recipient (simulated)", message: nextStop.phone })}>Call</Button>
            </div>
          </>
        ) : (
          <p className="mt-1 text-[13px] text-charcoal-400">No stops remaining — nice work.</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ActionButton icon={driver.shiftStarted ? "pause" : "play"} label={driver.shiftStarted ? "End shift" : "Start shift"} tone={driver.shiftStarted ? "secondary" : "primary"}
          onClick={() => { dispatch({ type: "SHIFT", driverId: driver.id, on: !driver.shiftStarted }); toast({ tone: "success", title: driver.shiftStarted ? "Shift ended" : "Shift started", message: driver.shiftStarted ? "Have a good evening." : "Remember your vehicle inspection." }); }} />
        <ActionButton icon="clipboard" label="Inspect vehicle" onClick={() => setInspectOpen(true)} />
        <ActionButton icon="route" label="Start route" disabled={blocked} onClick={() => { navigate("/driver/route"); toast({ tone: "success", title: "Route started", message: `${route.id} · ${route.name}` }); }} />
        <ActionButton icon="warning" label="Report issue" tone="danger" onClick={() => setIncidentOpen(true)} />
        <ActionButton icon="eye" label="Near miss" onClick={() => setNearMissOpen(true)} />
        <ActionButton icon="truck" label="My vehicle" onClick={() => navigate("/driver/vehicle")} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-mist-200 bg-white p-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">My vehicle</p>
          <p className="mt-1 text-[15px] font-bold text-navy-950">{vehicle.id}</p>
          <p className="text-[12px] text-charcoal-500">{vehicle.registration}</p>
          <div className="mt-2"><Progress value={vehicle.energyPct} tone={vehicle.energyPct < 25 ? "warning" : "success"} /></div>
          <p className="mt-1 text-[11.5px] text-charcoal-400">{vehicle.energyPct.toFixed(0)}% {vehicle.fuelType === "Electric" ? "battery" : "fuel"}</p>
        </div>
        <div className="rounded-lg border border-mist-200 bg-white p-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">My route</p>
          <p className="mt-1 text-[15px] font-bold text-navy-950">{route.id}</p>
          <p className="text-[12px] text-charcoal-500">{route.name}</p>
          <p className="mt-2 text-[11.5px] text-charcoal-400">{km(route.distanceKm)} · finish by {route.eta}</p>
        </div>
      </div>

      <div className="rounded-lg border border-mist-200 bg-white p-3">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">My safety</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Tile label="Safety score" value={driver.safetyScore} tone="green" />
          <Tile label="Incidents" value={driver.incidents} tone={driver.incidents ? "amber" : "navy"} />
          <Tile label="Near misses" value={driver.nearMisses} />
        </div>
      </div>
    </div>
  );

  const RouteScreen = (
    <div className="space-y-3 p-3">
      <div className="rounded-lg bg-navy-950 p-4 text-white">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-brand-400">Today's route</p>
        <p className="mt-1 text-[18px] font-bold">{route.id} · {route.name}</p>
        <p className="text-[12.5px] text-mist-300">{vehicle.id} · start {route.startTime} · finish by {route.eta}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-white/10 py-2"><p className="num text-[18px] font-bold">{route.stops.length}</p><p className="text-[10.5px] text-mist-300">Stops</p></div>
          <div className="rounded-md bg-white/10 py-2"><p className="num text-[18px] font-bold text-brand-300">{completed.length}</p><p className="text-[10.5px] text-mist-300">Done</p></div>
          <div className="rounded-md bg-white/10 py-2"><p className="num text-[18px] font-bold text-amber-300">{remaining.length}</p><p className="text-[10.5px] text-mist-300">Left</p></div>
        </div>
      </div>
      <ol className="space-y-2">
        {myDeliveries.slice(0, 30).map((d, i) => (
          <li key={d.id}>
            <button onClick={() => setParam("d", d.id)} className="flex w-full items-center gap-3 rounded-lg border border-mist-200 bg-white p-3 text-left hover:border-brand-300">
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-bold", d.status === "Delivered" ? "bg-brand-500 text-white" : "bg-mist-100 text-charcoal-500")}>
                {d.status === "Delivered" ? "✓" : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-navy-950">{d.destination}, {d.suburb}</span>
                <span className="block truncate text-[12px] text-charcoal-400">{d.id} · {d.recipient} · ETA {time24(d.eta)}</span>
              </span>
              <StatusBadge status={d.status} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  const DeliveriesScreen = (
    <div className="space-y-2 p-3">
      <div className="grid grid-cols-3 gap-2">
        <Tile label="Assigned" value={myDeliveries.length} />
        <Tile label="Completed" value={completed.length} tone="green" />
        <Tile label="Remaining" value={remaining.length} tone="amber" />
      </div>
      {myDeliveries.slice(0, 40).map((d) => (
        <button key={d.id} onClick={() => setParam("d", d.id)} className="flex w-full items-center gap-3 rounded-lg border border-mist-200 bg-white p-3 text-left">
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold text-navy-950">{d.id}</span>
            <span className="block truncate text-[12px] text-charcoal-400">{d.destination}, {d.suburb}</span>
            <span className="block truncate text-[11.5px] text-charcoal-400">{state.customers.find((c) => c.id === d.customerId)?.business} · {d.parcels} parcel(s)</span>
          </span>
          <StatusBadge status={d.status} />
        </button>
      ))}
    </div>
  );

  const VehicleScreen = (
    <div className="space-y-3 p-3">
      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[18px] font-bold text-navy-950">{vehicle.id}</p>
            <p className="text-[12.5px] text-charcoal-500">{vehicle.model} · {vehicle.registration}</p>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Tile label={vehicle.fuelType === "Electric" ? "Battery" : "Fuel"} value={`${vehicle.energyPct.toFixed(0)}%`} tone={vehicle.energyPct < 25 ? "amber" : "green"} />
          <Tile label="Odometer (km)" value={num(vehicle.mileageKm)} />
          <Tile label="Payload (kg)" value={vehicle.payloadKg} />
          <Tile label="Next service" value={dateSA(vehicle.nextServiceDate).slice(0, 6)} />
        </div>
      </div>
      {blocked && <Banner tone="critical" icon="warning" title="Vehicle blocked from dispatch">{vehicle.blockedReason}</Banner>}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon="clipboard" label="Run inspection" tone="primary" onClick={() => setInspectOpen(true)} />
        <ActionButton icon="wrench" label="Report a fault" tone="danger" onClick={() => setIncidentOpen(true)} />
      </div>
      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Last inspection</p>
        {(() => {
          const last = state.inspections.find((i) => i.vehicleId === vehicle.id);
          if (!last) return <p className="mt-1 text-[13px] text-charcoal-400">No inspection recorded yet today.</p>;
          const failed = last.items.filter((i) => i.result === "Fail");
          return (
            <>
              <p className="mt-1 text-[13.5px] font-semibold text-navy-950">{dateSA(last.date)} {last.time} · {last.result}</p>
              <p className="text-[12.5px] text-charcoal-500">{last.items.length - failed.length} of {last.items.length} checks passed</p>
              {failed.length > 0 && <p className="mt-1 text-[12.5px] text-red-700">Failed: {failed.map((f) => f.name).join(", ")}</p>}
            </>
          );
        })()}
      </div>
      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Vehicle documents</p>
        <ul className="mt-2 space-y-1.5">
          {state.documents.filter((d) => d.entityId === vehicle.id).map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="truncate text-charcoal-700">{d.docType}</span>
              <StatusBadge status={d.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const MoreScreen = (
    <div className="space-y-3 p-3">
      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">My profile</p>
        <p className="mt-1 text-[16px] font-bold text-navy-950">{driver.name}</p>
        <p className="text-[12.5px] text-charcoal-500">{driver.id} · {driver.phone}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Tile label="On-time" value={pct(driver.onTimePct)} tone="green" />
          <Tile label="First attempt" value={pct(driver.firstAttemptPct)} />
          <Tile label="Rating" value={driver.rating.toFixed(1)} />
        </div>
      </div>
      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <p className="text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">My training</p>
        <ul className="mt-2 space-y-1.5">
          {driver.training.map((t) => (
            <li key={t.course} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="truncate text-charcoal-700">{t.course}</span>
              <StatusBadge status={t.status} />
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon="shield" label="Report incident" tone="danger" onClick={() => setIncidentOpen(true)} />
        <ActionButton icon="eye" label="Report near miss" onClick={() => setNearMissOpen(true)} />
      </div>
      <div className="rounded-lg border border-mist-200 bg-white p-4">
        <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Switch driver (demo)</p>
        <select
          value={driver.id}
          onChange={(e) => dispatch({ type: "SET_SESSION", patch: { driverId: e.target.value } })}
          className="w-full rounded-md border border-mist-300 px-3 py-2 text-[13.5px]"
          aria-label="Switch driver"
        >
          {state.drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name} · {d.status}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Link to="/ops" className="flex items-center justify-between rounded-lg border border-mist-200 bg-white px-4 py-3 text-[13.5px] font-semibold text-charcoal-700">
          Operations platform <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
        <Link to="/portal" className="flex items-center justify-between rounded-lg border border-mist-200 bg-white px-4 py-3 text-[13.5px] font-semibold text-charcoal-700">
          Customer portal <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
        <Link to="/" className="flex items-center justify-between rounded-lg border border-mist-200 bg-white px-4 py-3 text-[13.5px] font-semibold text-charcoal-700">
          Sign out to website <Icon name="logout" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  /* --------------------- delivery detail (full screen) --------------------- */

  const DeliveryDetail = openDelivery && (
    <div className="fixed inset-0 z-50 flex flex-col bg-mist-100">
      <header className="flex items-center gap-3 border-b border-mist-200 bg-white px-3 py-3">
        <button onClick={() => setParam("d", null)} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-md border border-mist-300">
          <Icon name="chevronLeft" className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-navy-950">{openDelivery.id}</p>
          <p className="truncate text-[12px] text-charcoal-400">{state.customers.find((c) => c.id === openDelivery.customerId)?.business}</p>
        </div>
        <StatusBadge status={openDelivery.status} />
      </header>
      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-3">
        <div className="rounded-lg border border-mist-200 bg-white p-4">
          <p className="text-[16px] font-bold text-navy-950">{openDelivery.destination}</p>
          <p className="text-[13px] text-charcoal-500">{openDelivery.suburb}, Gauteng</p>
          <div className="mt-3 space-y-1.5 text-[13px]">
            <p><span className="text-charcoal-400">Recipient: </span><span className="font-semibold text-navy-950">{openDelivery.recipient}</span></p>
            <p><span className="text-charcoal-400">Phone: </span>{openDelivery.phone}</p>
            <p><span className="text-charcoal-400">Parcel: </span>{openDelivery.parcels} parcel(s) · {openDelivery.weightKg} kg</p>
            <p><span className="text-charcoal-400">Service: </span>{openDelivery.service} ({openDelivery.priority})</p>
            <p><span className="text-charcoal-400">Window: </span>{openDelivery.window} · ETA {time24(openDelivery.eta)}</p>
            <p><span className="text-charcoal-400">Pickup: </span>{openDelivery.pickup}</p>
          </div>
          {openDelivery.instructions && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
              <Icon name="info" className="mr-1 inline h-3.5 w-3.5" /> {openDelivery.instructions}
            </p>
          )}
          <Button variant="secondary" icon="phone" className="mt-3 w-full" onClick={() => toast({ tone: "info", title: "Calling recipient (simulated)", message: openDelivery.phone })}>
            Call recipient
          </Button>
        </div>

        <div className="rounded-lg border border-mist-200 bg-white p-4">
          <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-charcoal-400">Progress</p>
          <ol className="space-y-1.5">
            {openDelivery.events.map((e, i) => (
              <li key={i} className="flex gap-2 text-[12.5px]">
                <span className="num w-10 shrink-0 font-semibold text-charcoal-400">{time24(e.at)}</span>
                <span className="text-charcoal-700"><span className="font-semibold text-navy-950">{e.label}</span> {e.detail ? `· ${e.detail}` : ""}</span>
              </li>
            ))}
          </ol>
        </div>

        {openDelivery.pod && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
            <p className="text-[13px] font-bold text-brand-800">Proof of delivery captured</p>
            <svg viewBox="0 0 300 110" className="mt-2 h-20 w-full rounded bg-white">
              <path d={openDelivery.pod.signature} fill="none" stroke="#081120" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <p className="mt-1.5 text-[12px] text-brand-800">Signed by {openDelivery.pod.recipient} · {time24(openDelivery.pod.capturedAt)}</p>
          </div>
        )}
      </div>
      <footer className="grid grid-cols-2 gap-2 border-t border-mist-200 bg-white p-3">
        {openDelivery.status === "Assigned" && <ActionButton icon="send" label="Dispatched from hub" tone="primary" onClick={() => advance(openDelivery, "Dispatched", "Dispatched")} />}
        {openDelivery.status === "Dispatched" && <ActionButton icon="package" label="Picked up" tone="primary" onClick={() => advance(openDelivery, "Picked Up", "Parcel collected")} />}
        {openDelivery.status === "Picked Up" && <ActionButton icon="truck" label="In transit" tone="primary" onClick={() => advance(openDelivery, "In Transit", "In transit")} />}
        {openDelivery.status === "In Transit" && (
          <>
            <ActionButton icon="pin" label="Arrived" onClick={() => toast({ tone: "info", title: "Arrival logged", message: `${openDelivery.id} · ${openDelivery.suburb}` })} />
            <ActionButton icon="check" label="Deliver & capture POD" tone="primary" onClick={() => setPodId(openDelivery.id)} />
          </>
        )}
        {openDelivery.status === "Delivered" && !openDelivery.pod && <ActionButton icon="pen" label="Capture POD" tone="primary" onClick={() => setPodId(openDelivery.id)} />}
        {["Dispatched", "Picked Up", "In Transit"].includes(openDelivery.status) && (
          <ActionButton icon="warning" label="Report failure" tone="danger" onClick={() => setFailId(openDelivery.id)} />
        )}
        {openDelivery.status === "Delivered" && openDelivery.pod && (
          <div className="col-span-2 rounded-lg bg-brand-50 px-3 py-3 text-center text-[13px] font-bold text-brand-800">DELIVERY COMPLETE</div>
        )}
      </footer>
    </div>
  );

  const screen =
    page === "/driver/route" ? RouteScreen :
    page === "/driver/deliveries" ? DeliveriesScreen :
    page === "/driver/vehicle" ? VehicleScreen :
    page === "/driver/more" ? MoreScreen : Home;

  const activeTab = TABS.find((t) => t.to === page)?.key ?? "home";

  return (
    <div className="min-h-screen bg-mist-100 lg:flex lg:items-start lg:justify-center lg:gap-8 lg:p-8">
      <div className="hidden max-w-sm lg:block">
        <Logo tone="dark" />
        <h1 className="mt-3 text-[24px] font-bold tracking-tight text-navy-950">Driver Application</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-charcoal-500">
          The mobile app our drivers use every day: start a shift, inspect the vehicle, work through the route, capture
          proof of delivery and report safety issues. Everything a driver does here appears instantly in the operations
          platform and the customer portal.
        </p>
        <ul className="mt-4 space-y-2 text-[13.5px] text-charcoal-700">
          {["Start shift and 13-point vehicle inspection", "Route stops in delivery sequence", "Picked up → in transit → delivered", "Signature and photo proof of delivery", "Report a failure, incident or near miss"].map((x) => (
            <li key={x} className="flex gap-2"><Icon name="check" className="mt-0.5 h-4 w-4 text-brand-600" />{x}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/ops"><Button variant="secondary" icon="dashboard">Operations platform</Button></Link>
          <Link to="/portal"><Button variant="secondary" icon="briefcase">Customer portal</Button></Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[460px] bg-white lg:overflow-hidden lg:rounded-[28px] lg:border-8 lg:border-navy-950 lg:shadow-2xl">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-navy-950 px-3 py-2.5">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="num text-[12px] text-mist-300">{time24(new Date().toISOString())}</span>
            <Link to="/" aria-label="Exit driver app" className="grid h-8 w-8 place-items-center rounded-md border border-white/20 text-white">
              <Icon name="logout" className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <div className="min-h-[560px] pb-20">{screen}</div>
        <nav className="sticky bottom-0 z-20 grid grid-cols-5 border-t border-mist-200 bg-white" aria-label="Driver navigation">
          {TABS.map((t) => (
            <Link
              key={t.key}
              to={t.to}
              className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold", activeTab === t.key ? "text-brand-600" : "text-charcoal-400")}
            >
              <Icon name={t.icon} className="h-5 w-5" />
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {DeliveryDetail}
      <InspectionModal vehicleId={inspectOpen ? vehicle.id : null} open={inspectOpen} onClose={() => setInspectOpen(false)} driverId={driver.id} />
      <PodModal deliveryId={podId} open={!!podId} onClose={() => setPodId(null)} />
      <FailModal deliveryId={failId} open={!!failId} onClose={() => setFailId(null)} />
      <IncidentModal open={incidentOpen} onClose={() => setIncidentOpen(false)} defaults={{ driverId: driver.id, vehicleId: vehicle.id }} />
      <NearMissModal open={nearMissOpen} onClose={() => setNearMissOpen(false)} defaults={{ driverId: driver.id, vehicleId: vehicle.id }} />
    </div>
  );
}
