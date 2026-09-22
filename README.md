# EASY DROP — Delivering a Smarter Tomorrow

A complete, frontend-only product demonstration of the digital operating system for a South African
three-wheel last-mile delivery company. **Smart. Secure. Traceable.**

Everything is simulated: no backend, no authentication, no payments, no GPS/telematics APIs, no maps
API, no SMS or email. All four experiences share **one** in-memory state store, so an action in one
place immediately shows up everywhere else.

## The four connected experiences

| Experience | Route | What it is |
|---|---|---|
| Public website | `#/`, `#/about`, `#/services`, `#/business-solutions`, `#/how-it-works`, `#/contact`, `#/login` | Marketing site + demo login |
| Operations platform | `#/ops/...` | Dashboard, dispatch, routes, tracking, hub, fleet, people, safety, business, compliance, system |
| Driver application | `#/driver`, `/route`, `/deliveries`, `/vehicle`, `/more` | Mobile-first driver app |
| Business customer portal | `#/portal`, `/deliveries`, `/create`, `/tracking`, `/pod`, `/reports`, `/account` | Customer self-service |

## Architecture

```
src/
  types/index.ts            Domain model (mirrors future backend tables)
  data/seed.ts              Deterministic seed data (PRNG) — geography, fleet, drivers, 386 deliveries, 30-day history
  state/
    store.tsx               React context + reducer: ALL business rules live here (+ localStorage persistence)
    selectors.ts            Derived analytics: KPIs, range stats, fleet summary, finance, break-even, search
  router.tsx                ~90-line hash router (path + query params, <Link>, navigate)
  components/
    ui.tsx                  Design-system primitives (Button, Card, Badge, Stat, Modal, Drawer, Table, …)
    charts.tsx              Dependency-free SVG charts (bar, line, donut, h-bars, stacked, sparkline)
    Icon.tsx                Inline SVG icon set + logo
    FleetMap.tsx            Simulated Gauteng operating map (pure SVG)
    workflow/               Cross-cutting workflows reused by every experience
      DeliveryWorkflows.tsx   Create delivery, assign, POD (signature pad), failure, delivery drawer
      FleetWorkflows.tsx      Vehicle inspection, maintenance booking, incident, near miss
  layouts/AppShell.tsx      Operations shell: sidebar, global search, notifications, demo controls, role switcher
  pages/
    site/PublicSite.tsx     Public website
    ops/*                   Operations pages grouped by domain
    driver/DriverApp.tsx    Driver application
    portal/CustomerPortal.tsx Customer portal
```

### Key rules implemented in `state/store.tsx`

* **Delivery lifecycle** — Pending → Scheduled → Assigned → Dispatched → Picked Up → In Transit →
  Delivered / Failed / Returned, with a timestamped event written at every step.
* **Proof of delivery** — signature (drawn), photo (simulated), notes, time, location, driver, vehicle.
* **Inspection logic** — failing a *critical* item sets the vehicle to `Inspection Required`, blocks
  dispatch, raises a repair job and creates a notification. Completing the repair returns it to service.
* **Dispatch guard** — `canDispatch()` blocks vehicles that are in maintenance, out of service or awaiting
  an inspection, and always surfaces the reason.
* **Demo controls** — `+ Generate` (creates a booking and completes a delivery with POD),
  `Simulate Movement` (moves vehicle markers every 1.2 s), `Reset Demo` (restores seed data).

### Connecting a real backend later

State is only mutated through `dispatch({ type: … })` actions, and every page reads through
`useStore()` / `selectors.ts`. To go live, replace the reducer's cases with API calls (the entity names
already match `users`, `drivers`, `vehicles`, `deliveries`, `routes`, `delivery_events`,
`proof_of_delivery`, `vehicle_inspections`, `maintenance`, `fuel_records`, `parts`, `incidents`,
`near_misses`, `telematics_events`, `compliance_documents`, `notifications`) — no page needs to change.

## Commands

```bash
npm run dev      # local development
npm run build    # production build (single-file dist/index.html)
npm run preview  # preview the build
```

## Disclaimers used in the product

* “DEMO ENVIRONMENT — SIMULATED DATA” appears in the operations shell and settings.
* “SIMULATED TELEMATICS” is shown wherever vehicle positions or driving events appear.
* “ILLUSTRATIVE DEMO DATA — NOT ACTUAL COMPANY FINANCIAL RESULTS” is shown on Financials and Break-even.
* Compliance records are simulated; no legal certification is claimed. Three-wheel vehicles are
  described as well suited to urban delivery — never as eliminating accident or rollover risk.
