/**
 * EASY DROP — shared domain model.
 * These interfaces mirror the future backend tables (users, drivers, vehicles,
 * deliveries, routes, inspections, maintenance, incidents, ...) so that the
 * frontend can be pointed at a real API later with minimal churn.
 */

export type Role = "ADMIN" | "OPERATIONS" | "DISPATCHER" | "DRIVER" | "BUSINESS CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Suspended";
  lastActive: string;
  linkedId?: string; // driverId or customerId
}

export type DeliveryStatus =
  | "Pending"
  | "Scheduled"
  | "Assigned"
  | "Dispatched"
  | "Picked Up"
  | "In Transit"
  | "Delivered"
  | "Failed"
  | "Returned";

export type ServiceType =
  | "Standard Local"
  | "Extended Urban"
  | "Same-Day Priority"
  | "Scheduled Route"
  | "Reverse Logistics";

export type Priority = "Standard" | "High" | "Urgent";

export type HubStage =
  | "Received"
  | "Scanned"
  | "Sorted"
  | "Assigned"
  | "Loaded"
  | "Dispatched"
  | "Delivered";

export interface DeliveryEvent {
  at: string; // ISO
  label: string;
  detail?: string;
  actor?: string;
}

export interface ProofOfDelivery {
  recipient: string;
  signature: string; // SVG path data (simulated capture)
  photo: string; // simulated photo reference / label
  notes: string;
  capturedAt: string;
  location: string;
  driverId: string;
  vehicleId: string;
}

export interface Delivery {
  id: string;
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
  status: DeliveryStatus;
  hubStage: HubStage;
  driverId: string | null;
  vehicleId: string | null;
  routeId: string | null;
  createdAt: string;
  window: string;
  eta: string;
  instructions: string;
  notes: string;
  price: number;
  attempts: number;
  onTime: boolean | null;
  firstAttempt: boolean | null;
  failureReason?: string;
  pod?: ProofOfDelivery;
  events: DeliveryEvent[];
  createdBy: "Operations" | "Customer Portal" | "Demo Generator";
}

export type DriverStatus = "Available" | "On Route" | "Off Duty" | "On Leave";

export interface TrainingRecord {
  course: string;
  status: "Completed" | "Pending" | "Expired";
  date: string;
  expires?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: DriverStatus;
  vehicleId: string | null;
  routeId: string | null;
  licence: string;
  licenceClass: string;
  licenceExpiry: string;
  zone: string;
  joined: string;
  deliveriesToday: number;
  deliveriesTotal: number;
  onTimePct: number;
  firstAttemptPct: number;
  safetyScore: number;
  incidents: number;
  nearMisses: number;
  rating: number;
  shiftStarted: string | null;
  training: TrainingRecord[];
}

export type VehicleStatus =
  | "Available"
  | "On Route"
  | "Maintenance"
  | "Inspection Required"
  | "Out of Service";

export interface Vehicle {
  id: string;
  registration: string;
  model: string;
  year: number;
  type: string;
  payloadKg: number;
  fuelType: "Petrol" | "Electric";
  mileageKm: number;
  driverId: string | null;
  routeId: string | null;
  zone: string;
  status: VehicleStatus;
  energyPct: number; // fuel % or battery %
  lastInspection: string;
  lastInspectionResult: "Pass" | "Fail";
  nextServiceKm: number;
  nextServiceDate: string;
  revenueMtd: number;
  costsMtd: number;
  deliveriesMtd: number;
  utilisationPct: number;
  pos: { x: number; y: number };
  progress: number; // 0..1 along its route path
  speed: number; // km/h simulated
  blockedReason?: string;
}

export interface Customer {
  id: string;
  business: string;
  industry: string;
  contactName: string;
  phone: string;
  email: string;
  pickupLocations: string[];
  contract: string;
  slaTargetPct: number;
  monthlyVolume: number;
  deliveriesMtd: number;
  revenueMtd: number;
  onTimePct: number;
  complaints: number;
  billingTerms: string;
  accountNumber: string;
  since: string;
  logoTone: string;
}

export type RouteStatus = "Planned" | "Active" | "Completed" | "Delayed";

export interface DeliveryRoute {
  id: string;
  name: string;
  zone: string;
  driverId: string | null;
  vehicleId: string | null;
  stops: string[]; // delivery ids in sequence
  distanceKm: number;
  status: RouteStatus;
  startTime: string;
  eta: string;
  path: { x: number; y: number }[];
  colour: string;
}

export interface InspectionItem {
  name: string;
  result: "Pass" | "Fail";
  critical: boolean;
  notes: string;
}

export interface Inspection {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
  time: string;
  result: "Pass" | "Fail";
  criticalFail: boolean;
  items: InspectionItem[];
  odometer: number;
}

export type MaintenanceStatus = "Scheduled" | "Due" | "Overdue" | "In Progress" | "Completed";

export interface MaintenanceJob {
  id: string;
  vehicleId: string;
  service: string;
  mileage: number;
  date: string;
  technician: string;
  cost: number;
  status: MaintenanceStatus;
  notes: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  fuelType: "Petrol" | "Electric";
  units: number; // litres or kWh
  cost: number;
  distanceKm: number;
}

export interface Part {
  id: string;
  sku: string;
  name: string;
  category: string;
  qty: number;
  minStock: number;
  unitCost: number;
  supplier: string;
}

export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface Incident {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  driverId: string | null;
  vehicleId: string | null;
  deliveryId: string | null;
  severity: Severity;
  description: string;
  correctiveAction: string;
  status: "Open" | "Under Review" | "Closed";
  preventable: boolean;
}

export interface NearMiss {
  id: string;
  driverId: string;
  vehicleId: string | null;
  location: string;
  date: string;
  time: string;
  riskType: string;
  description: string;
  action: string;
}

export interface TelematicsEvent {
  id: string;
  vehicleId: string;
  type: "Harsh Braking" | "Harsh Acceleration" | "Speeding" | "Idling" | "Sharp Cornering";
  time: string;
  value: string;
  location: string;
}

export type NotificationKind =
  | "delivery"
  | "driver"
  | "vehicle"
  | "inspection"
  | "maintenance"
  | "safety"
  | "compliance"
  | "customer"
  | "route";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  tone: "info" | "success" | "warning" | "critical";
  title: string;
  message: string;
  at: string;
  read: boolean;
  link: string;
}

export interface Activity {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  at: string;
  link: string;
}

export interface ComplianceDoc {
  id: string;
  entityType: "Vehicle" | "Driver" | "Company";
  entityId: string;
  entityName: string;
  name: string;
  docType: string;
  issued: string;
  expires: string;
  status: "Valid" | "Expiring Soon" | "Expired";
}

export interface DailyStat {
  date: string; // YYYY-MM-DD
  deliveries: number;
  completed: number;
  failed: number;
  onTimePct: number;
  firstAttemptPct: number;
  revenue: number;
  costs: number;
  utilisationPct: number;
  distanceKm: number;
  complaints: number;
  incidents: number;
}

export interface BreakEvenInputs {
  vehicles: number;
  operatingDays: number;
  deliveriesPerVehicleDay: number;
  revenuePerDelivery: number;
  driverCostPerVehicle: number;
  fuelPerVehicle: number;
  maintenancePerVehicle: number;
  insurancePerVehicle: number;
  financePerVehicle: number;
  depotCosts: number;
  otherCosts: number;
}

export interface Settings {
  companyName: string;
  registration: string;
  depot: string;
  operatingHours: string;
  currency: string;
  distanceUnit: string;
  autoAssign: boolean;
  requireInspection: boolean;
  podPhotoRequired: boolean;
  notifyDeliveryCreated: boolean;
  notifySafety: boolean;
  notifyMaintenance: boolean;
  density: "Comfortable" | "Compact";
}

export interface AppState {
  seedVersion: number;
  today: string;
  users: User[];
  drivers: Driver[];
  vehicles: Vehicle[];
  customers: Customer[];
  deliveries: Delivery[];
  routes: DeliveryRoute[];
  inspections: Inspection[];
  maintenance: MaintenanceJob[];
  fuel: FuelRecord[];
  parts: Part[];
  incidents: Incident[];
  nearMisses: NearMiss[];
  telematics: TelematicsEvent[];
  notifications: AppNotification[];
  activities: Activity[];
  documents: ComplianceDoc[];
  history: DailyStat[];
  breakEven: BreakEvenInputs;
  settings: Settings;
  session: {
    role: Role;
    userName: string;
    driverId: string;
    customerId: string;
  };
  simulating: boolean;
}
