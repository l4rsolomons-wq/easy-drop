import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Activity,
  AppNotification,
  AppState,
  Delivery,
  DeliveryStatus,
  Incident,
  InspectionItem,
  MaintenanceJob,
  NearMiss,
  NotificationKind,
  Priority,
  ServiceType,
  Vehicle,
} from "@/types";
import { createSeedState, HUB, SEED_VERSION, SERVICE_PRICE, SUBURBS } from "@/data/seed";
import { mulberry32, pick, randInt } from "@/lib/format";

const STORAGE_KEY = `easydrop.state.v${SEED_VERSION}`;

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const nowISO = () => new Date().toISOString();
const hhmm = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

let idCounter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36).slice(-5)}${(idCounter++).toString(36)}`;

const notify = (
  state: AppState,
  n: { kind: NotificationKind; tone: AppNotification["tone"]; title: string; message: string; link: string },
): AppNotification[] => [
  { id: uid("NTF"), at: nowISO(), read: false, ...n },
  ...state.notifications,
].slice(0, 80);

const logActivity = (
  state: AppState,
  a: { kind: NotificationKind; title: string; detail: string; link: string },
): Activity[] => [{ id: uid("ACT"), at: nowISO(), ...a }, ...state.activities].slice(0, 60);

const addEvent = (d: Delivery, label: string, detail: string, actor: string): Delivery => ({
  ...d,
  events: [...d.events, { at: nowISO(), label, detail, actor }],
});

const etaFromNow = (mins: number) => new Date(Date.now() + mins * 60000).toISOString();

/* ------------------------------------------------------------------ */
/* Actions                                                            */
/* ------------------------------------------------------------------ */

export interface CreateDeliveryInput {
  customerId: string;
  recipient: string;
  phone: string;
  pickup: string;
  destination: string;
  suburb: string;
  parcels: number;
  weightKg: number;
  service: ServiceType;
  priority: Priority;
  window: string;
  instructions: string;
  notes: string;
  source: Delivery["createdBy"];
}

export type Action =
  | { type: "CREATE_DELIVERY"; input: CreateDeliveryInput }
  | { type: "ASSIGN_DELIVERY"; id: string; driverId: string | null; vehicleId: string | null; routeId: string | null }
  | { type: "ADVANCE_DELIVERY"; id: string; status: DeliveryStatus }
  | { type: "CAPTURE_POD"; id: string; recipient: string; notes: string; photo: string; signature: string }
  | { type: "FAIL_DELIVERY"; id: string; reason: string }
  | { type: "RESOLVE_FAILED"; id: string; mode: "retry" | "reschedule" | "return" }
  | { type: "SET_HUB_STAGE"; id: string; stage: Delivery["hubStage"] }
  | { type: "SUBMIT_INSPECTION"; vehicleId: string; driverId: string; items: InspectionItem[] }
  | { type: "SET_VEHICLE_STATUS"; vehicleId: string; status: Vehicle["status"]; reason?: string }
  | { type: "UPDATE_MAINTENANCE"; id: string; status: MaintenanceJob["status"] }
  | { type: "CREATE_MAINTENANCE"; job: Omit<MaintenanceJob, "id"> }
  | { type: "REPORT_INCIDENT"; incident: Omit<Incident, "id"> }
  | { type: "REPORT_NEAR_MISS"; nearMiss: Omit<NearMiss, "id"> }
  | { type: "ADJUST_PART"; id: string; delta: number }
  | { type: "MARK_READ"; id: string }
  | { type: "MARK_ALL_READ" }
  | { type: "SET_SIMULATING"; on: boolean }
  | { type: "SIMULATE_TICK" }
  | { type: "GENERATE_ACTIVITY" }
  | { type: "RESET_DEMO" }
  | { type: "SET_SESSION"; patch: Partial<AppState["session"]> }
  | { type: "SET_BREAKEVEN"; patch: Partial<AppState["breakEven"]> }
  | { type: "UPDATE_SETTINGS"; patch: Partial<AppState["settings"]> }
  | { type: "SHIFT"; driverId: string; on: boolean };

/* ------------------------------------------------------------------ */
/* Reducer — all domain rules live here                                */
/* ------------------------------------------------------------------ */

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CREATE_DELIVERY": {
      const i = action.input;
      const maxId = state.deliveries.reduce((m, d) => {
        const n = Number(d.id.replace("DW-", ""));
        return Number.isFinite(n) && n > m ? n : m;
      }, 10000);
      const id = `DW-${maxId + 1}`;
      const suburb = SUBURBS.find((s) => s.name === i.suburb) ?? SUBURBS[0];
      const route = state.routes.find((r) => r.zone === suburb.zone) ?? null;
      const customer = state.customers.find((c) => c.id === i.customerId);
      const delivery: Delivery = {
        id,
        customerId: i.customerId,
        recipient: i.recipient,
        phone: i.phone,
        pickup: i.pickup,
        destination: i.destination,
        suburb: i.suburb,
        parcels: i.parcels,
        weightKg: i.weightKg,
        service: i.service,
        priority: i.priority,
        status: "Pending",
        hubStage: "Received",
        driverId: null,
        vehicleId: null,
        routeId: null,
        createdAt: nowISO(),
        window: i.window,
        eta: etaFromNow(i.priority === "Urgent" ? 75 : 150),
        instructions: i.instructions,
        notes: i.notes,
        price: SERVICE_PRICE[i.service] + (i.priority === "Urgent" ? 20 : i.priority === "High" ? 10 : 0),
        attempts: 0,
        onTime: null,
        firstAttempt: null,
        events: [
          {
            at: nowISO(),
            label: "Created",
            detail: `Booked by ${customer?.business ?? "customer"} · ${i.service}`,
            actor: i.source,
          },
        ],
        createdBy: i.source,
      };
      return {
        ...state,
        deliveries: [delivery, ...state.deliveries],
        notifications: notify(state, {
          kind: "delivery",
          tone: "info",
          title: "New delivery created",
          message: `${id} · ${customer?.business ?? ""} → ${i.suburb}${route ? ` · suggested ${route.id}` : ""}`,
          link: `/ops/deliveries?id=${id}`,
        }),
        activities: logActivity(state, {
          kind: "delivery",
          title: "Delivery created",
          detail: `${id} · ${i.service} to ${i.suburb} (${i.source})`,
          link: `/ops/deliveries?id=${id}`,
        }),
      };
    }

    case "ASSIGN_DELIVERY": {
      const driver = state.drivers.find((d) => d.id === action.driverId);
      const vehicle = state.vehicles.find((v) => v.id === action.vehicleId);
      const routes = state.routes.map((r) =>
        r.id === action.routeId && !r.stops.includes(action.id)
          ? { ...r, stops: [...r.stops, action.id] }
          : r,
      );
      return {
        ...state,
        routes,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? addEvent(
                {
                  ...d,
                  driverId: action.driverId,
                  vehicleId: action.vehicleId,
                  routeId: action.routeId,
                  status: "Assigned",
                  hubStage: "Assigned",
                },
                "Assigned",
                `${driver?.name ?? "Driver"} · ${vehicle?.id ?? "Vehicle"}${action.routeId ? ` · ${action.routeId}` : ""}`,
                "Dispatch",
              )
            : d,
        ),
        notifications: notify(state, {
          kind: "driver",
          tone: "info",
          title: "Driver assigned",
          message: `${action.id} assigned to ${driver?.name ?? "driver"} on ${vehicle?.id ?? "vehicle"}`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
        activities: logActivity(state, {
          kind: "driver",
          title: "Driver assigned",
          detail: `${action.id} → ${driver?.name ?? ""} (${vehicle?.id ?? ""})`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
      };
    }

    case "ADVANCE_DELIVERY": {
      const target = state.deliveries.find((d) => d.id === action.id);
      if (!target) return state;
      const detailMap: Record<string, string> = {
        Dispatched: `Left ${HUB.name}`,
        "Picked Up": `Parcel collected at ${target.pickup}`,
        "In Transit": `En route to ${target.suburb}`,
        Delivered: "Delivered to recipient",
      };
      const driver = state.drivers.find((d) => d.id === target.driverId);
      const delivered = action.status === "Delivered";
      const deliveries = state.deliveries.map((d) =>
        d.id === action.id
          ? addEvent(
              {
                ...d,
                status: action.status,
                hubStage: action.status === "Dispatched" ? "Dispatched" : delivered ? "Delivered" : d.hubStage,
                onTime: delivered ? new Date().getTime() <= new Date(d.eta).getTime() + 15 * 60000 : d.onTime,
                firstAttempt: delivered ? d.attempts <= 1 : d.firstAttempt,
                attempts: action.status === "Picked Up" ? Math.max(1, d.attempts) : d.attempts,
              },
              action.status,
              detailMap[action.status] ?? "",
              driver?.name ?? "Operations",
            )
          : d,
      );
      let vehicles = state.vehicles;
      if (action.status === "Dispatched" && target.vehicleId) {
        vehicles = state.vehicles.map((v) =>
          v.id === target.vehicleId && (v.status === "Available" || v.status === "On Route")
            ? { ...v, status: "On Route" }
            : v,
        );
      }
      return {
        ...state,
        deliveries,
        vehicles,
        drivers: delivered
          ? state.drivers.map((d) =>
              d.id === target.driverId ? { ...d, deliveriesToday: d.deliveriesToday + 1 } : d,
            )
          : state.drivers,
        notifications: delivered
          ? notify(state, {
              kind: "delivery",
              tone: "success",
              title: "Delivery completed",
              message: `${action.id} delivered in ${target.suburb}`,
              link: `/ops/deliveries?id=${action.id}`,
            })
          : state.notifications,
        activities: logActivity(state, {
          kind: "delivery",
          title:
            action.status === "Dispatched"
              ? "Vehicle dispatched"
              : action.status === "Delivered"
                ? "Delivery completed"
                : `Delivery ${action.status.toLowerCase()}`,
          detail: `${action.id} · ${target.suburb}`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
      };
    }

    case "CAPTURE_POD": {
      const target = state.deliveries.find((d) => d.id === action.id);
      if (!target) return state;
      const pod = {
        recipient: action.recipient || target.recipient,
        signature: action.signature || "M5,40 C20,12 35,52 50,26 C66,6 80,44 95,22",
        photo: action.photo || "Parcel photo captured at delivery point",
        notes: action.notes,
        capturedAt: nowISO(),
        location: `${target.suburb}, Gauteng`,
        driverId: target.driverId ?? state.session.driverId,
        vehicleId: target.vehicleId ?? "3W-001",
      };
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? addEvent(
                {
                  ...d,
                  pod,
                  status: "Delivered",
                  hubStage: "Delivered",
                  onTime: d.onTime ?? true,
                  firstAttempt: d.firstAttempt ?? d.attempts <= 1,
                },
                "Proof of delivery captured",
                `Signed by ${pod.recipient}`,
                state.drivers.find((x) => x.id === pod.driverId)?.name ?? "Driver",
              )
            : d,
        ),
        notifications: notify(state, {
          kind: "delivery",
          tone: "success",
          title: "POD captured",
          message: `${action.id} · signed by ${pod.recipient}`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
        activities: logActivity(state, {
          kind: "delivery",
          title: "POD captured",
          detail: `${action.id} · signature and photo stored`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
      };
    }

    case "FAIL_DELIVERY": {
      const target = state.deliveries.find((d) => d.id === action.id);
      if (!target) return state;
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? addEvent(
                { ...d, status: "Failed", failureReason: action.reason, attempts: d.attempts + 1, onTime: false, firstAttempt: false },
                "Failed",
                action.reason,
                state.drivers.find((x) => x.id === d.driverId)?.name ?? "Driver",
              )
            : d,
        ),
        notifications: notify(state, {
          kind: "delivery",
          tone: "warning",
          title: "Delivery failed",
          message: `${action.id} · ${action.reason}`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
        activities: logActivity(state, {
          kind: "delivery",
          title: "Delivery problem logged",
          detail: `${action.id} · ${action.reason}`,
          link: `/ops/deliveries?id=${action.id}`,
        }),
      };
    }

    case "RESOLVE_FAILED": {
      const map: Record<string, { status: DeliveryStatus; label: string; hub: Delivery["hubStage"] }> = {
        retry: { status: "Assigned", label: "Retry scheduled", hub: "Assigned" },
        reschedule: { status: "Scheduled", label: "Rescheduled for next working day", hub: "Sorted" },
        return: { status: "Returned", label: "Returned to hub", hub: "Received" },
      };
      const m = map[action.mode];
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id
            ? addEvent({ ...d, status: m.status, hubStage: m.hub }, m.label, "", "Operations")
            : d,
        ),
        activities: logActivity(state, {
          kind: "delivery",
          title: m.label,
          detail: action.id,
          link: `/ops/deliveries?id=${action.id}`,
        }),
      };
    }

    case "SET_HUB_STAGE":
      return {
        ...state,
        deliveries: state.deliveries.map((d) =>
          d.id === action.id ? addEvent({ ...d, hubStage: action.stage }, `Hub: ${action.stage}`, "", "Hub") : d,
        ),
      };

    case "SUBMIT_INSPECTION": {
      const criticalFail = action.items.some((i) => i.result === "Fail" && i.critical);
      const anyFail = action.items.some((i) => i.result === "Fail");
      const vehicle = state.vehicles.find((v) => v.id === action.vehicleId);
      const inspection = {
        id: uid("INS"),
        vehicleId: action.vehicleId,
        driverId: action.driverId,
        date: state.today,
        time: hhmm(),
        result: (anyFail ? "Fail" : "Pass") as "Pass" | "Fail",
        criticalFail,
        items: action.items,
        odometer: vehicle?.mileageKm ?? 0,
      };
      const failedItems = action.items.filter((i) => i.result === "Fail").map((i) => i.name);
      const vehicles = state.vehicles.map((v) =>
        v.id === action.vehicleId
          ? {
              ...v,
              lastInspection: state.today,
              lastInspectionResult: inspection.result,
              status: criticalFail ? ("Inspection Required" as const) : v.status === "Inspection Required" ? ("Available" as const) : v.status,
              blockedReason: criticalFail ? `Failed inspection: ${failedItems.join(", ")}` : undefined,
              driverId: criticalFail ? v.driverId : v.driverId,
            }
          : v,
      );
      const maintenance = criticalFail
        ? [
            {
              id: uid("MNT"),
              vehicleId: action.vehicleId,
              service: `Repair after failed inspection — ${failedItems.join(", ")}`,
              mileage: vehicle?.mileageKm ?? 0,
              date: state.today,
              technician: "Unassigned",
              cost: 0,
              status: "Due" as const,
              notes: "Raised automatically from a failed pre-shift inspection.",
            },
            ...state.maintenance,
          ]
        : state.maintenance;
      return {
        ...state,
        inspections: [inspection, ...state.inspections],
        vehicles,
        maintenance,
        notifications: criticalFail
          ? notify(state, {
              kind: "inspection",
              tone: "critical",
              title: "Inspection failed — vehicle blocked",
              message: `${action.vehicleId} cannot be dispatched (${failedItems.join(", ")}). A repair job was created.`,
              link: `/ops/vehicles?id=${action.vehicleId}`,
            })
          : notify(state, {
              kind: "inspection",
              tone: "success",
              title: "Inspection passed",
              message: `${action.vehicleId} passed its pre-shift inspection.`,
              link: `/ops/inspections`,
            }),
        activities: logActivity(state, {
          kind: "inspection",
          title: criticalFail ? "Inspection failed" : "Inspection passed",
          detail: `${action.vehicleId} · ${action.items.filter((i) => i.result === "Pass").length}/${action.items.length} checks passed`,
          link: "/ops/inspections",
        }),
      };
    }

    case "SET_VEHICLE_STATUS":
      return {
        ...state,
        vehicles: state.vehicles.map((v) =>
          v.id === action.vehicleId
            ? { ...v, status: action.status, blockedReason: action.reason }
            : v,
        ),
        activities: logActivity(state, {
          kind: "vehicle",
          title: "Vehicle status changed",
          detail: `${action.vehicleId} → ${action.status}`,
          link: `/ops/vehicles?id=${action.vehicleId}`,
        }),
      };

    case "UPDATE_MAINTENANCE": {
      const job = state.maintenance.find((m) => m.id === action.id);
      if (!job) return state;
      const completed = action.status === "Completed";
      // only work that is actually in the workshop keeps a vehicle off the road
      const stillBlocked = state.maintenance.some(
        (m) => m.vehicleId === job.vehicleId && m.id !== job.id && m.status === "In Progress",
      );
      return {
        ...state,
        maintenance: state.maintenance.map((m) => (m.id === action.id ? { ...m, status: action.status } : m)),
        vehicles: state.vehicles.map((v) => {
          if (v.id !== job.vehicleId) return v;
          if (completed && !stillBlocked)
            return { ...v, status: v.status === "On Route" ? v.status : "Available", blockedReason: undefined, nextServiceKm: v.mileageKm + 10000 };
          if (action.status === "In Progress")
            return { ...v, status: "Maintenance", blockedReason: `${job.service} in progress` };
          return v;
        }),
        notifications: completed
          ? notify(state, {
              kind: "maintenance",
              tone: "success",
              title: "Maintenance completed",
              message: `${job.vehicleId} · ${job.service}. Vehicle is available for dispatch.`,
              link: `/ops/vehicles?id=${job.vehicleId}`,
            })
          : state.notifications,
        activities: logActivity(state, {
          kind: "maintenance",
          title: completed ? "Maintenance completed" : `Maintenance ${action.status.toLowerCase()}`,
          detail: `${job.vehicleId} · ${job.service}`,
          link: "/ops/maintenance",
        }),
      };
    }

    case "CREATE_MAINTENANCE":
      return {
        ...state,
        maintenance: [{ id: uid("MNT"), ...action.job }, ...state.maintenance],
        activities: logActivity(state, {
          kind: "maintenance",
          title: "Maintenance job booked",
          detail: `${action.job.vehicleId} · ${action.job.service}`,
          link: "/ops/maintenance",
        }),
      };

    case "REPORT_INCIDENT": {
      const incident = { id: uid("INC"), ...action.incident };
      return {
        ...state,
        incidents: [incident, ...state.incidents],
        drivers: state.drivers.map((d) =>
          d.id === incident.driverId ? { ...d, incidents: d.incidents + 1, safetyScore: Math.max(40, d.safetyScore - 6) } : d,
        ),
        notifications: notify(state, {
          kind: "safety",
          tone: incident.severity === "Critical" || incident.severity === "High" ? "critical" : "warning",
          title: "Safety incident reported",
          message: `${incident.id} · ${incident.type} · ${incident.location}`,
          link: `/ops/incidents?id=${incident.id}`,
        }),
        activities: logActivity(state, {
          kind: "safety",
          title: "Safety incident reported",
          detail: `${incident.id} · ${incident.type} (${incident.severity})`,
          link: `/ops/incidents?id=${incident.id}`,
        }),
      };
    }

    case "REPORT_NEAR_MISS": {
      const nm = { id: uid("NM"), ...action.nearMiss };
      return {
        ...state,
        nearMisses: [nm, ...state.nearMisses],
        drivers: state.drivers.map((d) => (d.id === nm.driverId ? { ...d, nearMisses: d.nearMisses + 1 } : d)),
        notifications: notify(state, {
          kind: "safety",
          tone: "info",
          title: "Near miss reported",
          message: `${nm.id} · ${nm.riskType} · ${nm.location}`,
          link: "/ops/near-misses",
        }),
        activities: logActivity(state, {
          kind: "safety",
          title: "Near miss reported",
          detail: `${nm.id} · ${nm.riskType}`,
          link: "/ops/near-misses",
        }),
      };
    }

    case "ADJUST_PART":
      return {
        ...state,
        parts: state.parts.map((p) => (p.id === action.id ? { ...p, qty: Math.max(0, p.qty + action.delta) } : p)),
      };

    case "MARK_READ":
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)) };

    case "MARK_ALL_READ":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case "SET_SIMULATING":
      return { ...state, simulating: action.on };

    case "SIMULATE_TICK": {
      const rand = mulberry32(Date.now() % 100000);
      const vehicles = state.vehicles.map((v) => {
        if (v.status !== "On Route") return v;
        const route = state.routes.find((r) => r.id === v.routeId);
        const path = route?.path ?? [
          { x: HUB.x, y: HUB.y },
          { x: HUB.x + 10, y: HUB.y - 12 },
        ];
        const progress = (v.progress + 0.022 + rand() * 0.012) % 1;
        const seg = progress * (path.length - 1);
        const i = Math.floor(seg);
        const t = seg - i;
        const a = path[i];
        const b = path[Math.min(path.length - 1, i + 1)];
        return {
          ...v,
          progress,
          pos: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
          speed: Math.round(16 + rand() * 34),
          energyPct: Math.max(6, +(v.energyPct - 0.25).toFixed(1)),
          mileageKm: v.mileageKm + 1,
        };
      });
      const moving = vehicles.filter((v) => v.status === "On Route");
      const telematics =
        rand() > 0.72 && moving.length
          ? [
              {
                id: uid("TEL"),
                vehicleId: pick(rand, moving).id,
                type: pick(rand, ["Harsh Braking", "Harsh Acceleration", "Speeding", "Sharp Cornering", "Idling"] as const),
                time: nowISO(),
                value: pick(rand, ["-0.41 g", "0.36 g", "67 km/h in 60 zone", "8 min stationary"]),
                location: pick(rand, SUBURBS).name,
              },
              ...state.telematics,
            ].slice(0, 60)
          : state.telematics;
      return { ...state, vehicles, telematics };
    }

    case "GENERATE_ACTIVITY": {
      const rand = mulberry32(Date.now() % 99991);
      const customer = pick(rand, state.customers);
      const suburb = pick(rand, SUBURBS);
      // 1. new booking
      let next = reducer(state, {
        type: "CREATE_DELIVERY",
        input: {
          customerId: customer.id,
          recipient: `${pick(rand, ["Lindiwe", "Sipho", "Anja", "Kagiso", "Rashid", "Elsa"])} ${pick(rand, ["Nkosi", "Botha", "Pillay", "Mabaso", "Jacobs"])}`,
          phone: `07${randInt(rand, 1, 9)} ${randInt(rand, 200, 999)} ${randInt(rand, 1000, 9999)}`,
          pickup: customer.pickupLocations[0],
          destination: `${randInt(rand, 1, 200)} ${pick(rand, ["Main Rd", "Church St", "Rivonia Rd", "Oxford Rd", "New Rd"])}`,
          suburb: suburb.name,
          parcels: randInt(rand, 1, 3),
          weightKg: Math.round(rand() * 120) / 10 + 0.5,
          service: pick(rand, ["Standard Local", "Extended Urban", "Same-Day Priority"]),
          priority: pick(rand, ["Standard", "High", "Urgent"]),
          window: pick(rand, ["08:00 – 12:00", "12:00 – 16:00", "14:00 – 18:00"]),
          instructions: "",
          notes: "",
          source: "Demo Generator",
        },
      });
      // 2. progress a random in-transit delivery
      const inTransit = next.deliveries.filter((d) => d.status === "In Transit");
      if (inTransit.length) {
        const target = pick(rand, inTransit);
        next = reducer(next, { type: "ADVANCE_DELIVERY", id: target.id, status: "Delivered" });
        next = reducer(next, {
          type: "CAPTURE_POD",
          id: target.id,
          recipient: target.recipient,
          notes: "Auto-captured by demo generator",
          photo: "Parcel photo captured at delivery point",
          signature: "M5,42 C22,10 38,50 54,24 C70,6 84,40 95,20",
        });
      }
      return next;
    }

    case "RESET_DEMO":
      return createSeedState();

    case "SET_SESSION":
      return { ...state, session: { ...state.session, ...action.patch } };

    case "SET_BREAKEVEN":
      return { ...state, breakEven: { ...state.breakEven, ...action.patch } };

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case "SHIFT": {
      const driver = state.drivers.find((d) => d.id === action.driverId);
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.driverId
            ? { ...d, shiftStarted: action.on ? nowISO() : null, status: action.on ? "On Route" : "Off Duty" }
            : d,
        ),
        activities: logActivity(state, {
          kind: "driver",
          title: action.on ? "Shift started" : "Shift ended",
          detail: `${driver?.name ?? action.driverId}`,
          link: `/ops/drivers?id=${action.driverId}`,
        }),
      };
    }

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  tone: "success" | "info" | "warning" | "critical";
  title: string;
  message?: string;
}

interface StoreValue {
  state: AppState;
  dispatch: (a: Action) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.seedVersion === SEED_VERSION && parsed.today === new Date().toISOString().slice(0, 10)) {
        return { ...parsed, simulating: false };
      }
    }
  } catch {
    /* ignore corrupt storage — fall back to seed */
  }
  return createSeedState();
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const saveTimer = useRef<number | undefined>(undefined);

  const dispatch = useCallback((a: Action) => {
    rawDispatch(a);
    if (a.type === "RESET_DEMO") localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid("TST");
    setToasts((prev) => [...prev, { id, ...t }].slice(-4));
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  // debounced persistence — the demo survives a page refresh
  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* storage full — non-fatal for a demo */
      }
    }, 600);
    return () => window.clearTimeout(saveTimer.current);
  }, [state]);

  // simulated telematics loop
  useEffect(() => {
    if (!state.simulating) return;
    const t = window.setInterval(() => rawDispatch({ type: "SIMULATE_TICK" }), 1200);
    return () => window.clearInterval(t);
  }, [state.simulating]);

  const value = useMemo(
    () => ({ state, dispatch, toasts, toast, dismissToast }),
    [state, dispatch, toasts, toast, dismissToast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const useAppState = (): AppState => useStore().state;
